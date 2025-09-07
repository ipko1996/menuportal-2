import * as fs from 'node:fs';
import * as path from 'node:path';

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';

import {
  platformSchedules,
  schedules,
  ScheduleType,
  socialMediaAccount,
  SocialMediaPlatform,
} from '@/schema';
import { DatabaseService } from '@/shared/database/database.service';
import { DateRange } from '@/shared/pipes';

import { BusinessHoursService } from '../business-hours/business-hours.service';
import { RestaurantSettingsService } from '../restaurant/restaurant.service';
import { WeekMenuDayDto } from '../week-menu/dto/week-menu-response.dto';
import { WeekMenuService } from '../week-menu/week-menu.service';
import Handlebars from './helpers/helper';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(
    private readonly weekMenuService: WeekMenuService,
    private readonly databaseService: DatabaseService,
    private readonly businessHoursService: BusinessHoursService,
    private readonly restaurantSettings: RestaurantSettingsService
  ) {}

  public async renderWeeklyMenuHtml(
    restaurantId: number,
    dateRange: DateRange,
    platform?: SocialMediaPlatform
  ): Promise<string> {
    // 1. Fetch both menu and restaurant data
    const menuData = await this.weekMenuService.getMenusForWeek(
      dateRange,
      restaurantId
    );
    const restaurantData = await this.restaurantSettings.findOne(restaurantId);

    const templateId = platform
      ? await this._getPlatformTemplateId(restaurantId, 'WEEKLY', platform)
      : await this._getDefaultTemplateId(restaurantId, 'WEEKLY');

    // Take out not business days from menuData
    const businessHours = await this.businessHoursService.findAll(restaurantId);
    const businessDays = new Set(businessHours.map(bh => bh.dayOfWeek));

    // Filter out non-business days from menuData
    const filteredDays: Record<string, WeekMenuDayDto> = {};

    for (const dateString of Object.keys(menuData.days)) {
      const date = new Date(dateString);
      const dayOfWeek = date
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toUpperCase() as
        | 'MONDAY'
        | 'TUESDAY'
        | 'WEDNESDAY'
        | 'THURSDAY'
        | 'FRIDAY'
        | 'SATURDAY'
        | 'SUNDAY';

      // Only include days that are business days
      if (businessDays.has(dayOfWeek)) {
        filteredDays[dateString] = menuData.days[dateString];
      }
    }

    // Update menuData with filtered days
    menuData.days = filteredDays;

    // 2. Combine all data into a single object for the template
    const templateData = {
      menu: menuData,
      restaurant: restaurantData,
    };

    return this._compileTemplate(templateId, templateData);
  }

  public async renderDailyMenuHtml(
    restaurantId: number,
    dateRange: DateRange,
    platform?: SocialMediaPlatform
  ): Promise<string> {
    // 1. Fetch both menu and restaurant data
    const menuData = await this.weekMenuService.getMenusForWeek(
      dateRange,
      restaurantId
    );
    const restaurantData = await this.restaurantSettings.findOne(restaurantId);

    const templateId = platform
      ? await this._getPlatformTemplateId(restaurantId, 'DAILY', platform)
      : await this._getDefaultTemplateId(restaurantId, 'DAILY');

    // 2. Combine all data into a single object for the template
    const templateData = {
      menu: menuData,
      restaurant: restaurantData,
    };

    return this._compileTemplate(templateId, templateData);
  }

  private async _getDefaultTemplateId(
    restaurantId: number,
    scheduleType: ScheduleType
  ): Promise<string> {
    const result = await this.databaseService.db
      .select({ templateId: schedules.defaultTemplateId })
      .from(schedules)
      .where(
        and(
          eq(schedules.restaurantId, restaurantId),
          eq(schedules.scheduleType, scheduleType),
          eq(schedules.isActive, true)
        )
      )
      .limit(1);

    if (!result[0]?.templateId) {
      throw new NotFoundException(
        `Default template for active '${scheduleType}' schedule not found for restaurant ${restaurantId}.`
      );
    }
    return result[0].templateId;
  }

  private async _getPlatformTemplateId(
    restaurantId: number,
    scheduleType: ScheduleType,
    platform: SocialMediaPlatform
  ): Promise<string> {
    const result = await this.databaseService.db
      .select({
        templateId:
          sql<string>`COALESCE(${platformSchedules.templateId}, ${schedules.defaultTemplateId})`.as(
            'templateId'
          ),
      })
      .from(schedules)
      .innerJoin(
        platformSchedules,
        eq(schedules.id, platformSchedules.scheduleId)
      )
      .innerJoin(
        socialMediaAccount,
        eq(platformSchedules.socialMediaAccountId, socialMediaAccount.id)
      )
      .where(
        and(
          eq(schedules.restaurantId, restaurantId),
          eq(schedules.scheduleType, scheduleType),
          eq(socialMediaAccount.platform, platform),
          eq(schedules.isActive, true),
          eq(platformSchedules.isActive, true),
          eq(socialMediaAccount.isActive, true)
        )
      )
      .limit(1);

    if (!result[0]?.templateId) {
      throw new NotFoundException(
        `No active '${scheduleType}' schedule for platform ${platform} found for restaurant ${restaurantId}.`
      );
    }
    return result[0].templateId;
  }

  private _compileTemplate(templateId: string, data: unknown): string {
    try {
      const templatePath = path.join(
        // eslint-disable-next-line unicorn/prefer-module
        __dirname,
        'modules/template/templates',
        `${templateId}.hbs`
      );
      this.logger.debug({
        message: `Compiling template with ID '${templateId}'`,
        templatePath,
      });
      const templateSource = fs.readFileSync(templatePath, 'utf8');

      const compiled = Handlebars.compile(templateSource);
      return compiled(data);
    } catch (error) {
      this.logger.error(
        `Template with ID '${templateId}' not found or failed to compile.`,
        error.stack
      );
      throw new NotFoundException(
        `Template with ID '${templateId}' not found.`
      );
    }
  }
}
