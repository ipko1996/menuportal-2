import * as fs from 'node:fs';
import * as path from 'node:path';

import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import {
  scheduleSettings,
  socialMediaAccount,
  SocialMediaPlatform,
} from '@/schema';
import { DatabaseService } from '@/shared/database/database.service';
import { DateRange } from '@/shared/pipes';

import { WeekMenuService } from '../week-menu/week-menu.service';
import Handlebars from './helpers/helper';

@Injectable()
export class TemplatesService {
  constructor(
    private readonly weekMenuService: WeekMenuService,
    private readonly databaseService: DatabaseService
  ) {}

  async renderMenuForWeek(
    restaurantId: number,
    dateRange: DateRange,
    platform: SocialMediaPlatform
  ) {
    const weekMenu = await this.weekMenuService.getMenusForWeek(
      dateRange,
      restaurantId
    );
    console.log(`Rendering menu for week and platform: ${platform}`, weekMenu);

    const settings = await this.databaseService.db
      .select({
        scheduleSettings: scheduleSettings,
        socialAccount: socialMediaAccount,
      })
      .from(scheduleSettings)
      .innerJoin(
        socialMediaAccount,
        eq(scheduleSettings.socialMediaAccountId, socialMediaAccount.id)
      )
      .where(
        and(
          eq(scheduleSettings.restaurantId, restaurantId),
          eq(socialMediaAccount.platform, platform),
          eq(scheduleSettings.isActive, true),
          eq(socialMediaAccount.isActive, true)
        )
      );

    if (settings.length === 0) {
      throw new NotFoundException(
        `No active schedule settings found for restaurant ${restaurantId} and platform ${platform}.`
      );
    }

    const templateId = settings[0].scheduleSettings.templateId;

    let templateSource: string;
    try {
      const templatePath = path.join(
        // eslint-disable-next-line unicorn/prefer-module
        __dirname,
        'modules/template/templates',
        `${templateId}.hbs`
      );
      templateSource = fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      console.error(`Template with ID ${templateId} not found.`, error);
      throw new NotFoundException(`Template with ID ${templateId} not found.`);
    }

    const compiled = Handlebars.compile(templateSource);
    return compiled(weekMenu);
  }
}
