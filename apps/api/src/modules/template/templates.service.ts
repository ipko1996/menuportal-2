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

import { WeekMenuService } from '../week-menu/week-menu.service';
import Handlebars from './helpers/helper';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);
  constructor(
    private readonly weekMenuService: WeekMenuService,
    private readonly databaseService: DatabaseService
  ) {}

  /**
   * Renders a menu for a given week, platform, and schedule type.
   * It finds the correct template (platform-specific or default) and compiles it with menu data.
   * @param restaurantId The ID of the restaurant.
   * @param dateRange The date range for which to fetch menu data.
   * @param platform The social media platform to render for (e.g., 'FACEBOOK').
   * @param scheduleType The type of schedule to render (e.g., 'weekly', 'daily').
   */
  async renderMenuForWeek(
    restaurantId: number,
    dateRange: DateRange,
    platform: SocialMediaPlatform,
    scheduleType: ScheduleType // Added to specify which schedule to render
  ) {
    // This part remains the same: it fetches the data to inject into the template.
    const weekMenu = await this.weekMenuService.getMenusForWeek(
      dateRange,
      restaurantId
    );
    this.logger.log(
      `Rendering menu for '${scheduleType}' schedule, platform: ${platform}`
    );

    // --- REFACTORED QUERY ---
    // This query now finds the correct templateId using the new schema.
    const result = await this.databaseService.db
      .select({
        // Use COALESCE to pick the platform-specific override, or fall back to the default.
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
          eq(schedules.scheduleType, scheduleType), // Filter by the specific schedule type
          eq(socialMediaAccount.platform, platform),
          eq(schedules.isActive, true),
          eq(platformSchedules.isActive, true),
          eq(socialMediaAccount.isActive, true)
        )
      )
      .limit(1); // We only expect one result for this specific combination

    if (result.length === 0 || !result[0].templateId) {
      throw new NotFoundException(
        `No active '${scheduleType}' schedule with a valid template found for restaurant ${restaurantId} and platform ${platform}.`
      );
    }

    const templateId = result[0].templateId;

    // This part for reading and compiling the template remains the same.
    let templateSource: string;
    try {
      const templatePath = path.join(
        // This path might need adjustment based on your project structure
        // eslint-disable-next-line unicorn/prefer-module
        __dirname,
        '../template/templates',
        `${templateId}.hbs`
      );
      templateSource = fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      this.logger.error(
        `Template with ID '${templateId}' not found.`,
        error.stack
      );
      throw new NotFoundException(
        `Template with ID '${templateId}' not found.`
      );
    }

    const compiled = Handlebars.compile(templateSource);
    return compiled(weekMenu);
  }
}
