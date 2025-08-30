import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import CronExpressionParser from 'cron-parser';
import { and, eq, sql } from 'drizzle-orm';

import {
  platformSchedules,
  post,
  postSnapshot,
  schedules,
  socialMediaAccount,
} from '@/schema';
import {
  DatabaseService,
  Transaction,
} from '@/shared/database/database.service';
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

  async createScheduleSettings(
    restaurantId: number,
    dto: ScheduleSettingsDto // Assumes this DTO now includes scheduleName and defaultTemplateUrl
  ): Promise<void> {
    this.logger.log(
      `Creating new schedule settings for restaurant ${restaurantId}`
    );
    // Assumes DTO is updated to include scheduleName and defaultTemplateUrl
    const { platforms, postTime, defaultContentText, scheduleType } = dto;

    const cronExpression = this.cronHelperService.dayTimeToCron(
      scheduleType,
      postTime
    );

    // Find all active social media accounts for this restaurant to use for validation
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
    this.logger.debug(
      `Found ${validAccounts.length} active social media accounts for validation.`
    );
    const validAccountIds = new Set(validAccounts.map(acc => acc.id));

    await this.databaseService.db.transaction(async tx => {
      // Step 1: Create the main 'schedules' record and get its new ID.
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

      this.logger.debug({ newSchedule });

      const scheduleId = newSchedule.id;
      this.logger.debug(`Created schedule with ID ${scheduleId}`);

      if (!scheduleId) {
        // This would indicate a serious insertion failure
        tx.rollback();
        throw new Error('Failed to create the main schedule record.');
      }

      // Step 2: Validate that all platform accounts belong to the restaurant
      for (const platform of platforms) {
        this.logger.debug({ message: 'creataing platform', platform });
        if (!validAccountIds.has(platform.socialMediaAccountId)) {
          tx.rollback();
          throw new BadRequestException(
            `Social media account with ID ${platform.socialMediaAccountId} does not belong to this restaurant or is not active.`
          );
        }
      }

      // Step 3: Prepare and bulk-insert all 'platform_schedules' records.
      // Assumes PlatformSettingsDto has an optional `templateUrl` property
      const platformSchedulesToInsert = platforms.map(p => ({
        scheduleId: scheduleId,
        socialMediaAccountId: p.socialMediaAccountId,
        contentText: p.contentText, // This is the override
        isActive: p.isActive,
      }));

      this.logger.debug('platformSchedulesToInsert', platformSchedulesToInsert);

      // Ensure there's at least one platform to schedule for
      if (platformSchedulesToInsert.length === 0) {
        tx.rollback();
        throw new BadRequestException(
          'At least one platform must be configured for the schedule.'
        );
      }
      this.logger.debug('platformSchedulesToInsert', platformSchedulesToInsert);
      await tx.insert(platformSchedules).values(platformSchedulesToInsert);
    });

    this.logger.log(
      `Successfully created schedule "${scheduleType}" for ${platforms.length} account(s).`
    );
  }

  async scheduleWeek(dateRange: DateRange, restaurantId: number) {
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
        `Week ${year}-${weekNumber} is already scheduled or published for restaurant ${restaurantId}`
      );
    }

    // 1. Fetch all active scheduling rules for the restaurant with updated schema.
    const schedulingRules = await this.databaseService.db
      .select({
        platformScheduleId: platformSchedules.id,
        socialMediaAccountId: socialMediaAccount.id,
        cronExpression: schedules.cronExpression,
        // UPDATED: Using COALESCE on the new `templateId` fields.
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

    // 2. Iterate through each day, parsing cron expressions to generate posts.
    const postsToCreate: Array<
      Omit<
        typeof post.$inferInsert,
        'id' | 'createdAt' | 'generatedImageUrl' | 'generatedPdfUrl'
      >
    > = [];

    // FIX: Parse string dates into Date objects for correct comparison.
    const startDate = new Date(startOfWeek);
    const endDate = new Date(endOfWeek);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException(
        'Invalid date format provided in dateRange.'
      );
    }

    const currentDate = startDate;
    while (currentDate <= endDate) {
      for (const rule of schedulingRules) {
        try {
          // FIX: Using the new parser syntax and robust date checking.
          const interval = CronExpressionParser.parse(rule.cronExpression, {
            currentDate: new Date(currentDate.setUTCHours(0, 0, 0, 0)), // Start check from beginning of the day
            tz: 'UTC',
          });

          const nextRun = interval.next().toDate();

          const endOfDay = new Date(currentDate);
          endOfDay.setUTCHours(23, 59, 59, 999);

          // If the next scheduled run is within the current day, we have a match.
          if (nextRun <= endOfDay) {
            postsToCreate.push({
              platformScheduleId: rule.platformScheduleId,
              socialMediaAccountId: rule.socialMediaAccountId,
              status: 'SCHEDULED',
              content: rule.finalContentText,
              scheduledAt: nextRun.toISOString(),
              // templateId: rule.finalTemplateId,
              retryCount: 0,
            });
          }
        } catch (error) {
          this.logger.error(
            `Invalid cron expression "${rule.cronExpression}" for platform schedule ID ${rule.platformScheduleId}`,
            error.stack
          );
        }
      }
      // Move to the next day
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    if (postsToCreate.length === 0) {
      this.logger.warn(
        `No posts were generated for restaurant ${restaurantId} for week ${year}-${weekNumber}. Check schedule timings.`
      );
      return;
    }

    // 3. Create snapshots and all generated posts in a single transaction.
    this.logger.log(
      `Generated ${postsToCreate.length} posts to be scheduled for restaurant ${restaurantId}.`
    );
    await this.databaseService.db.transaction(async tx => {
      this.logger.debug({
        message: 'Creating snapshots and linking posts',
        postsToCreate,
      });
      const snapshotIds = await this.snapshotService.createSnapshots(
        dateRange,
        restaurantId,
        tx
      );
      // This service method would need to be adapted to also link snapshots.
      await this.postService.createPostsAndLinkSnapshots(
        snapshotIds,
        postsToCreate,
        tx
      );
    });
  }

  async cancelScheduledWeek(dateRange: DateRange, restaurantId: number) {
    const { start: startOfWeek, end: endOfWeek, year, weekNumber } = dateRange;

    this.logger.log(
      `Cancelling scheduled week from ${startOfWeek} to ${endOfWeek} for restaurant ID ${restaurantId}`
    );

    await this.databaseService.db.transaction(async tx => {
      // Fetch snapshots for this restaurant and week that are scheduled
      const ids = await this.snapshotService.deleteSnapshots(
        dateRange,
        restaurantId,
        tx
      );
      this.logger.debug({ deletedSnapshotIds: ids });

      await this.postService.deletePosts(ids, tx);

      this.logger.log(
        `Deleted scheduled snapshot(s) for week ${year}-${weekNumber}`
      );
    });
  }
}
