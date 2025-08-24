import * as fs from 'node:fs'; // --- ADDED ---
import * as path from 'node:path'; // --- ADDED ---

import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { scheduleSettings, socialMediaAccount } from '@/schema';
import { DatabaseService } from '@/shared/database/database.service';
import { DateRange } from '@/shared/pipes';

import { WeekMenuService } from '../week-menu/week-menu.service';
import Handlebars from './helpers/helper'; // --- MODIFIED ---
// --- REMOVED --- We don't need the static import of 'template' anymore.

@Injectable()
export class TemplatesService {
  constructor(
    private readonly weekMenuService: WeekMenuService,
    private readonly databaseService: DatabaseService
  ) {}

  async renderMenuForWeek(restaurantId: number, dateRange: DateRange) {
    // 1. Get the data for the template
    const weekMenu = await this.weekMenuService.getMenusForWeek(
      dateRange,
      restaurantId
    );
    console.log('Rendering menu for week:', weekMenu);

    // 2. Get the settings, including the template ID
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
          eq(scheduleSettings.isActive, true),
          eq(socialMediaAccount.isActive, true)
        )
      );

    if (settings.length === 0) {
      throw new NotFoundException(
        `No active schedule settings found for restaurant ${restaurantId}.`
      );
    }

    const templateId = settings[0].scheduleSettings.templateId;

    // 3. Dynamically build the path and read the template file
    let templateSource: string;
    try {
      // dist/apps/api/modules/template/templates/2.hbs
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

    // 4. Compile the template and return the result
    const compiled = Handlebars.compile(templateSource);
    return compiled(weekMenu);
  }
}
