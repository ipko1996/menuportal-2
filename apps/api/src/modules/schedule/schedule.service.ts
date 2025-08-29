import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import {
  post,
  postSnapshot,
  scheduleSettings,
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
import {
  GetScheduleSettingsResponseDto,
  UpdateScheduleSettingsDto,
} from './dto/schedule-settings.dto';

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

  async getScheduleSettings(
    restaurantId: number
  ): Promise<GetScheduleSettingsResponseDto> {
    this.logger.log(
      `Fetching schedule settings for restaurant ${restaurantId}`
    );

    // Find the first active schedule setting for the restaurant
    const settings =
      await this.databaseService.db.query.scheduleSettings.findFirst({
        where: and(
          eq(scheduleSettings.restaurantId, restaurantId),
          eq(scheduleSettings.isActive, true)
        ),
      });

    if (!settings) {
      throw new NotFoundException(
        `No active schedule settings found for restaurant ${restaurantId}`
      );
    }

    const { day, time } = this.cronHelperService.cronToDayTime(
      settings.cronExpression
    );

    return {
      enabled: settings.isActive,
      postDay: day,
      postTime: time,
      message: settings.contentText ?? '',
    };
  }

  async updateScheduleSettings(
    restaurantId: number,
    dto: UpdateScheduleSettingsDto
  ): Promise<void> {
    this.logger.log(
      `Updating schedule settings for restaurant ${restaurantId}`
    );
    const { enabled, postDay, postTime, message } = dto;

    const cronExpression = this.cronHelperService.dayTimeToCron(
      postDay,
      postTime
    );

    // Find all active social media accounts for this restaurant
    const accounts = await this.databaseService.db
      .select({ id: socialMediaAccount.id })
      .from(socialMediaAccount)
      .where(
        and(
          eq(socialMediaAccount.restaurantId, restaurantId),
          eq(socialMediaAccount.isActive, true)
        )
      );

    if (accounts.length === 0) {
      throw new BadRequestException(
        'No active social media accounts found to apply settings to.'
      );
    }

    await this.databaseService.db.transaction(async tx => {
      for (const account of accounts) {
        const valuesToInsert = {
          restaurantId,
          socialMediaAccountId: account.id,
          cronExpression,
          contentText: message,
          isActive: enabled,
          scheduleName: 'Weekly Menu Post', // Default name
          updatedAt: new Date().toISOString(),
        };

        await tx
          .insert(scheduleSettings)
          .values(valuesToInsert)
          .onConflictDoUpdate({
            target: [
              scheduleSettings.restaurantId,
              scheduleSettings.socialMediaAccountId,
            ],
            set: {
              cronExpression: valuesToInsert.cronExpression,
              contentText: valuesToInsert.contentText,
              isActive: valuesToInsert.isActive,
              updatedAt: valuesToInsert.updatedAt,
            },
          });
      }
    });

    this.logger.log(
      `Successfully updated schedule settings for ${accounts.length} account(s).`
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

    const days = await this.weeklyOfferQueryService.getWeeklyDataForWeek(
      dateRange,
      restaurantId
    );

    // Check if there are Transaction menus or offers to schedule
    const hasItems = Object.values(days).some(
      day => day.menus.length > 0 || day.offers.length > 0
    );
    if (!hasItems) {
      throw new BadRequestException(
        `No menus or offers found to schedule for week ${year}-${weekNumber}`
      );
    }

    this.logger.log(
      `Saving weekly menus and daily menu items for week: ${year}-${weekNumber}`
    );

    // Get the schedule settings for the restaurant
    const settings = await this.databaseService.db
      .select({
        socialAccountId: socialMediaAccount.id,
        scheduleSettingsId: scheduleSettings.id,
        content: scheduleSettings.contentText,
        cron: scheduleSettings.cronExpression,
        // socialAccount: socialMediaAccount,
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

    // TODO: No active schedule settings found
    // TODO: Handle different scheduling scenarios (e.g., multiple schedules)
    // TODO: Hanle past, future, SCHEDULED, PUBLISHED, FAILED weeks ...

    await this.databaseService.db.transaction(async tx => {
      const snapshotIds = await this.snapshotService.createSnapshots(
        dateRange,
        restaurantId,
        tx
      );
      await this.postService.createPosts(snapshotIds, settings, tx);
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

      await this.postService.deletePostsBySnapshotIds(ids, tx);

      this.logger.log(
        `Deleted scheduled snapshot(s) for week ${year}-${weekNumber}`
      );
    });
  }
}
