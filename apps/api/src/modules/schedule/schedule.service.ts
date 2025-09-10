import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, exists, sql } from 'drizzle-orm';

import { ScheduleType } from '@/constants';
import {
  platformSchedules,
  post,
  schedules,
  socialMediaAccount,
} from '@/schema';
import { DatabaseService } from '@/shared/database/database.service';
import { DateRange } from '@/shared/pipes';
import { CronHelperService } from '@/shared/services/cron.helper.service';

import { PostService } from '../post/post.service';
import { SnapshotService } from '../snapshot/snapshot.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { GetScheduleSettingsResponseDto } from './dto/schedule-settings.dto';
import {
  UpdatePlatformScheduleDto,
  UpdateScheduleDto,
} from './dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cronHelperService: CronHelperService,
    private readonly snapshotService: SnapshotService,
    private readonly postService: PostService
  ) {}

  async getScheduleSettings(
    restaurantId: number,
    scheduleType: ScheduleType
  ): Promise<GetScheduleSettingsResponseDto | null> {
    this.logger.log(
      `Fetching '${scheduleType}' schedule settings for restaurant ${restaurantId}`
    );

    const schedule = await this.databaseService.db.query.schedules.findFirst({
      where: and(
        eq(schedules.restaurantId, restaurantId),
        eq(schedules.scheduleType, scheduleType)
      ),
      with: {
        platformSchedules: true,
      },
    });

    if (!schedule) {
      // eslint-disable-next-line unicorn/no-null
      return null;
    }

    const { time } = this.cronHelperService.cronToDayTime(
      schedule.cronExpression
    );

    return {
      id: schedule.id,
      scheduleType: schedule.scheduleType,
      postTime: time,
      defaultContentText: schedule.defaultContentText ?? '',
      isActive: schedule.isActive,
      platforms: schedule.platformSchedules.map(ps => ({
        id: ps.id,
        socialMediaAccountId: ps.socialMediaAccountId,
        contentText: ps.contentText,
        isActive: ps.isActive,
      })),
    };
  }

  async createScheduleSettings(
    restaurantId: number,
    dto: CreateScheduleDto
  ): Promise<void> {
    const { scheduleType, postTime, defaultContentText, platforms } = dto;
    this.logger.log(
      `Creating '${scheduleType}' schedule for restaurant ${restaurantId}`
    );

    const existing = await this.databaseService.db.query.schedules.findFirst({
      where: and(
        eq(schedules.restaurantId, restaurantId),
        eq(schedules.scheduleType, scheduleType)
      ),
      columns: { id: true },
    });

    if (existing) {
      throw new ConflictException(
        `Schedule with type '${scheduleType}' already exists for this restaurant.`
      );
    }

    const cronExpression = this.cronHelperService.dayTimeToCron(
      scheduleType,
      postTime
    );

    await this.databaseService.db.transaction(async tx => {
      const [newSchedule] = await tx
        .insert(schedules)
        .values({
          restaurantId,
          scheduleType,
          cronExpression,
          defaultContentText,
          isActive: true, // Default to active on creation
        })
        .returning({ id: schedules.id });

      if (platforms?.length > 0) {
        const platformSchedulesToInsert = platforms.map(p => ({
          scheduleId: newSchedule.id,
          socialMediaAccountId: p.socialMediaAccountId,
          contentText: p.contentText,
          isActive: p.isActive,
        }));
        await tx.insert(platformSchedules).values(platformSchedulesToInsert);
      }
    });
    this.logger.log('Successfully created schedule settings.');
  }

  async updateCoreScheduleSettings(
    restaurantId: number,
    scheduleType: ScheduleType,
    dto: UpdateScheduleDto
  ): Promise<void> {
    const { postTime, defaultContentText, isActive } = dto;
    this.logger.log(
      `Updating core '${scheduleType}' schedule for restaurant ${restaurantId}`
    );

    const cronExpression = this.cronHelperService.dayTimeToCron(
      scheduleType,
      postTime
    );

    const result = await this.databaseService.db
      .update(schedules)
      .set({
        cronExpression,
        defaultContentText,
        isActive,
      })
      .where(
        and(
          eq(schedules.restaurantId, restaurantId),
          eq(schedules.scheduleType, scheduleType)
        )
      );

    if (result.rowCount === 0) {
      throw new NotFoundException(
        `Schedule with type '${scheduleType}' not found for this restaurant.`
      );
    }
    this.logger.log('Successfully updated core schedule settings.');
  }

  async updatePlatformScheduleSettings(
    restaurantId: number,
    platformScheduleId: number,
    dto: UpdatePlatformScheduleDto
  ): Promise<void> {
    this.logger.log(
      `Updating platform schedule ID ${platformScheduleId} for restaurant ${restaurantId}`
    );

    // Security check: Ensure the platform schedule belongs to the restaurant
    const result = await this.databaseService.db
      .update(platformSchedules)
      .set({
        contentText: dto.contentText,
        isActive: dto.isActive,
      })
      .where(
        and(
          eq(platformSchedules.id, platformScheduleId),
          // This subquery ensures we only update if it's owned by the user's restaurant
          exists(
            this.databaseService.db
              .select()
              .from(schedules)
              .where(
                and(
                  eq(schedules.id, platformSchedules.scheduleId),
                  eq(schedules.restaurantId, restaurantId)
                )
              )
          )
        )
      );

    if (result.rowCount === 0) {
      throw new NotFoundException(
        `Platform schedule with ID ${platformScheduleId} not found or does not belong to this restaurant.`
      );
    }
    this.logger.log('Successfully updated platform schedule settings.');
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

        if (nextRun) {
          postsToCreate.push({
            platformScheduleId: rule.platformScheduleId,
            socialMediaAccountId: rule.socialMediaAccountId,
            status: 'SCHEDULED',
            content: rule.finalContentText,
            scheduledAt: nextRun.toISOString(),
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
