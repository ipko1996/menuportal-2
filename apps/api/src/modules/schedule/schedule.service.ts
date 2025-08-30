import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import CronExpressionParser from 'cron-parser';
import { and, eq, sql } from 'drizzle-orm';

import {
  platformSchedules,
  post,
  schedules,
  socialMediaAccount,
} from '@/schema';
import { DatabaseService } from '@/shared/database/database.service';
import { DateRange } from '@/shared/pipes';
import { CronHelperService } from '@/shared/services/cron.helper.service';
import { WeeklyOfferQueryService } from '@/shared/services/weekly-offer-query.service';

import { PostService } from '../post/post.service';
import { SnapshotService } from '../snapshot/snapshot.service';
import { type ScheduleSettingsDto } from './dto/schedule-settings.dto';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cronHelperService: CronHelperService,
    private readonly snapshotService: SnapshotService,
    private readonly weeklyOfferQueryService: WeeklyOfferQueryService,
    private readonly postService: PostService
  ) {}

  // async getScheduleSettings(
  //   restaurantId: number
  // ): Promise<GetScheduleSettingsResponseDto> {
  //   this.logger.log(
  //     `Fetching schedule settings for restaurant ${restaurantId}`
  //   );

  //   // Find the first active schedule setting for the restaurant
  //   const settings =
  //     await this.databaseService.db.query.scheduleSettings.findFirst({
  //       where: and(
  //         eq(scheduleSettings.restaurantId, restaurantId),
  //         eq(scheduleSettings.isActive, true)
  //       ),
  //     });

  //   if (!settings) {
  //     throw new NotFoundException(
  //       `No active schedule settings found for restaurant ${restaurantId}`
  //     );
  //   }

  //   const { day, time } = this.cronHelperService.cronToDayTime(
  //     settings.cronExpression
  //   );

  //   return {
  //     enabled: settings.isActive,
  //     postDay: day,
  //     postTime: time,
  //     message: settings.contentText ?? '',
  //   };
  // }

  /**
   * Creates a new schedule campaign for a restaurant, including its platform-specific settings.
   * Prevents creation if a schedule of the same type already exists for the restaurant.
   * @param restaurantId The ID of the restaurant.
   * @param dto The schedule settings data transfer object.
   * @throws {ConflictException} If a schedule of the same type already exists.
   * @throws {BadRequestException} If validation fails (e.g., no accounts, invalid platform ID).
   */
  async createScheduleSettings(
    restaurantId: number,
    dto: ScheduleSettingsDto
  ): Promise<void> {
    this.logger.log(
      `Attempting to create '${dto.scheduleType}' schedule for restaurant ${restaurantId}`
    );
    const { platforms, postTime, defaultContentText, scheduleType } = dto;

    // First, check if a schedule of this type already exists for the restaurant.
    const existingSchedule = await this.databaseService.db
      .select({ id: schedules.id })
      .from(schedules)
      .where(
        and(
          eq(schedules.restaurantId, restaurantId),
          eq(schedules.scheduleType, scheduleType)
        )
      )
      .limit(1);

    if (existingSchedule.length > 0) {
      throw new ConflictException(
        `A '${scheduleType}' schedule already exists for this restaurant.`
      );
    }

    const cronExpression = this.cronHelperService.dayTimeToCron(
      scheduleType,
      postTime
    );

    const validAccounts = await this.databaseService.db
      .select({ id: socialMediaAccount.id })
      .from(socialMediaAccount)
      .where(
        and(
          eq(socialMediaAccount.restaurantId, restaurantId),
          eq(socialMediaAccount.isActive, true)
        )
      );

    if (validAccounts.length === 0) {
      throw new BadRequestException(
        'No active social media accounts found for this restaurant.'
      );
    }
    const validAccountIds = new Set(validAccounts.map(acc => acc.id));

    await this.databaseService.db.transaction(async tx => {
      const [newSchedule] = await tx
        .insert(schedules)
        .values({
          restaurantId,
          scheduleType,
          cronExpression,
          defaultContentText,
          defaultTemplateId: 'weekly-original',
          isActive: true,
        })
        .returning({ id: schedules.id });

      if (!newSchedule?.id) {
        throw new InternalServerErrorException(
          'Failed to create the main schedule record and retrieve its ID.'
        );
      }
      const scheduleId = newSchedule.id;

      for (const platform of platforms) {
        if (!validAccountIds.has(platform.socialMediaAccountId)) {
          throw new BadRequestException(
            `Social media account with ID ${platform.socialMediaAccountId} does not belong to this restaurant or is not active.`
          );
        }
      }

      const platformSchedulesToInsert = platforms.map(p => ({
        scheduleId: scheduleId,
        socialMediaAccountId: p.socialMediaAccountId,
        contentText: p.contentText, // This is the override
        isActive: p.isActive,
      }));

      if (platformSchedulesToInsert.length === 0) {
        throw new BadRequestException(
          'At least one platform must be configured for the schedule.'
        );
      }

      await tx.insert(platformSchedules).values(platformSchedulesToInsert);
    });

    this.logger.log(
      `Successfully created '${scheduleType}' schedule for ${platforms.length} account(s).`
    );
  }

  /**
   * Generates and saves all scheduled posts for a given restaurant and week.
   * It evaluates all active scheduling rules (daily, weekly) and creates post records
   * for each match within the date range.
   * @param dateRange The week to schedule posts for.
   * @param restaurantId The ID of the restaurant.
   * @throws {BadRequestException} If the week is already scheduled or has no content.
   */
  async scheduleWeek(
    dateRange: DateRange,
    restaurantId: number
  ): Promise<void> {
    const { start: startOfWeek, end: endOfWeek, year, weekNumber } = dateRange;
    this.logger.log(
      `Scheduling from ${startOfWeek} to ${endOfWeek} for restaurant ID ${restaurantId}`
    );

    const existing = await this.snapshotService.getSnapshots(
      dateRange,
      restaurantId
    );
    if (existing.length > 0) {
      throw new BadRequestException(
        `Week ${year}-${weekNumber} is already scheduled for restaurant ${restaurantId}`
      );
    }

    const schedulingRules = await this.databaseService.db
      .select({
        platformScheduleId: platformSchedules.id,
        socialMediaAccountId: socialMediaAccount.id,
        cronExpression: schedules.cronExpression,
        finalTemplateId:
          sql<string>`COALESCE(${platformSchedules.templateId}, ${schedules.defaultTemplateId})`.as(
            'finalTemplateId'
          ),
        finalContentText:
          sql<string>`COALESCE(${platformSchedules.contentText}, ${schedules.defaultContentText})`.as(
            'finalContentText'
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
          eq(schedules.isActive, true),
          eq(platformSchedules.isActive, true),
          eq(socialMediaAccount.isActive, true)
        )
      );

    if (schedulingRules.length === 0) {
      throw new BadRequestException(
        `No active schedule settings found for restaurant ${restaurantId}.`
      );
    }

    const postsToCreate: Omit<typeof post.$inferInsert, 'id' | 'createdAt'>[] =
      [];
    const startDate = new Date(startOfWeek);
    const endDate = new Date(endOfWeek);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException(
        'Invalid date format provided in dateRange.'
      );
    }

    for (
      let day = new Date(startDate);
      day <= endDate;
      day.setUTCDate(day.getUTCDate() + 1)
    ) {
      for (const rule of schedulingRules) {
        const nextRun = this.cronHelperService.getScheduledRunForDay(
          rule.cronExpression,
          day
        );

        // If the helper function returns a valid date, create the post.
        if (nextRun) {
          postsToCreate.push({
            platformScheduleId: rule.platformScheduleId,
            socialMediaAccountId: rule.socialMediaAccountId,
            status: 'SCHEDULED',
            content: rule.finalContentText,
            scheduledAt: nextRun.toISOString(),
            // templateId: rule.finalTemplateId, // Assuming you need this from the query
            retryCount: 0,
          });
        }
      }
    }

    if (postsToCreate.length === 0) {
      this.logger.warn(
        `No posts were generated for restaurant ${restaurantId} for week ${year}-${weekNumber}.`
      );
      return;
    }

    this.logger.log(`Generated ${postsToCreate.length} posts to be scheduled.`);
    await this.databaseService.db.transaction(async tx => {
      const snapshotIds = await this.snapshotService.createSnapshots(
        dateRange,
        restaurantId,
        tx
      );
      await this.postService.createPostsAndLinkSnapshots(
        snapshotIds,
        postsToCreate,
        tx
      );
    });
  }

  /**
   * Cancels and deletes all scheduled (but not yet published) posts and their
   * associated snapshots for a given week.
   * @param dateRange The week to cancel.
   * @param restaurantId The ID of the restaurant.
   */
  async cancelScheduledWeek(
    dateRange: DateRange,
    restaurantId: number
  ): Promise<void> {
    const { year, weekNumber } = dateRange;
    this.logger.log(
      `Cancelling scheduled week ${year}-${weekNumber} for restaurant ID ${restaurantId}`
    );

    await this.databaseService.db.transaction(async tx => {
      const deletedSnapshotIds = await this.snapshotService.deleteSnapshots(
        dateRange,
        restaurantId,
        tx
      );

      if (deletedSnapshotIds.length > 0) {
        await this.postService.deletePostsForSnapshots(deletedSnapshotIds, tx);
        this.logger.log(
          `Deleted posts and snapshots for week ${year}-${weekNumber}.`
        );
      } else {
        this.logger.warn(
          `No scheduled snapshots found to cancel for week ${year}-${weekNumber}.`
        );
      }
    });
  }
}
