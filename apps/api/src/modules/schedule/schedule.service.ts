import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CronExpressionParser } from 'cron-parser';
import { isBefore } from 'date-fns';
import { and, between, eq, inArray } from 'drizzle-orm';

import {
  DayName,
  post,
  postSnapshot,
  scheduleSettings,
  snapshot,
  snapshotItem,
  snapshotMenu,
  snapshotOffer,
  socialMediaAccount,
} from '@/schema';
import {
  DatabaseService,
  Transaction,
} from '@/shared/database/database.service';
import { DateRange } from '@/shared/pipes';

import {
  DayMenuDto,
  DayOffersDto,
  Dish,
  WeekMenuDayDto,
} from '../week-menu/dto/week-menu-response.dto';
import { WeekMenuService } from '../week-menu/week-menu.service';
import { WeekScheduleService } from '../week-schedule/week-schedule.service';
import {
  GetScheduleSettingsResponseDto,
  UpdateScheduleSettingsDto,
} from './dto/schedule-settings.dto';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly weekMenuService: WeekMenuService,
    private readonly weekScheduleService: WeekScheduleService
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

    const { postDay, postTime } = this.cronToDayTime(settings.cronExpression);

    return {
      enabled: settings.isActive,
      postDay,
      postTime,
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

    const cronExpression = this.dayTimeToCron(postDay, postTime);

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

        // Upsert logic: insert or update settings for each social media account.
        await tx
          .insert(scheduleSettings)
          .values(valuesToInsert)
          .onConflictDoUpdate({
            // The unique constraint is on (restaurantId, socialMediaAccountId)
            // But we need to target just one for upsert logic if cron changes.
            // A more robust way is to target a unique combination.
            // Let's target the unique schedule for a restaurant/social account.
            // For simplicity in this context, we assume one schedule setting per social account.
            target: [
              scheduleSettings.restaurantId,
              scheduleSettings.socialMediaAccountId,
              scheduleSettings.cronExpression,
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

    const existing = await this.weekScheduleService.getExistingSchedules(
      dateRange,
      restaurantId
    );

    if (existing.snaps.length > 0) {
      throw new BadRequestException(
        `Week ${year}-${weekNumber} is already scheduled or published for restaurant ${restaurantId}`
      );
    }

    const days = await this.weekMenuService.getWeekDays(
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

    // TODO: No active schedule settings found
    // TODO: Handle different scheduling scenarios (e.g., multiple schedules)

    // const runs = settings.map(s => {
    //   return {
    //     cronExpression: s.scheduleSettings.cronExpression,
    //     nextRun: this.getNextScheduledAt(s.scheduleSettings.cronExpression),
    //   };
    // });

    // const earliestRun = runs.reduce((earliest, current) => {
    //   return current.nextRun < earliest.nextRun ? current : earliest;
    // }, runs[0]);

    // if (isBefore(new Date(endOfWeek), new Date(earliestRun.nextRun))) {
    //   throw new BadRequestException(
    //     `Cannot schedule a week in the past: ${year}-${weekNumber}`
    //   );
    // }

    await this.databaseService.db.transaction(async tx => {
      const snapshotIds = await this.createSnapshots(tx, restaurantId, days);
      await this.createPostsForSnapshots(tx, settings, snapshotIds);
    });
  }

  private async createSnapshots(
    tx: Transaction,
    restaurantId: number,
    days: Record<string, WeekMenuDayDto>
  ): Promise<number[]> {
    const snapshotIds: number[] = [];

    for (const [day, dayData] of Object.entries(days)) {
      const offerSnapshotIds = await this.createOfferSnapshots(
        tx,
        restaurantId,
        day,
        dayData.offers
      );
      const menuSnapshotIds = await this.createMenuSnapshots(
        tx,
        restaurantId,
        day,
        dayData.menus
      );

      snapshotIds.push(...offerSnapshotIds, ...menuSnapshotIds);
    }

    return snapshotIds;
  }

  private async createOfferSnapshots(
    tx: Transaction,
    restaurantId: number,
    day: string,
    offers: DayOffersDto[]
  ): Promise<number[]> {
    const snapshotIds: number[] = [];

    for (const offer of offers) {
      const [snap] = await tx
        .insert(snapshot)
        .values({
          restaurantId,
          entityType: 'OFFER',
          originalId: offer.offerId,
          date: day,
        })
        .returning();

      snapshotIds.push(snap.id);

      await tx.insert(snapshotOffer).values({
        snapshotId: snap.id,
        originalOfferId: offer.offerId,
        price: offer.price,
      });

      await this.createOfferSnapshotItem(tx, snap.id, offer.dish, restaurantId);
    }

    return snapshotIds;
  }

  private async createOfferSnapshotItem(
    tx: Transaction,
    snapshotId: number,
    dish: Dish,
    restaurantId: number
  ): Promise<void> {
    if (!dish.dishId || !dish.dishName || !dish.dishTypeId) {
      return;
    }

    await tx.insert(snapshotItem).values({
      snapshotId,
      originalDishId: dish.dishId,
      dishName: dish.dishName,
      dishTypeId: dish.dishTypeId,
      restaurantId,
      position: 1,
    });
  }

  private async createMenuSnapshots(
    tx: Transaction,
    restaurantId: number,
    day: string,
    menus: DayMenuDto[]
  ): Promise<number[]> {
    const snapshotIds: number[] = [];

    for (const menu of menus) {
      const [snap] = await tx
        .insert(snapshot)
        .values({
          restaurantId,
          entityType: 'MENU',
          originalId: menu.menuId,
          date: day,
        })
        .returning();

      snapshotIds.push(snap.id);

      await tx.insert(snapshotMenu).values({
        snapshotId: snap.id,
        originalMenuId: menu.menuId,
        menuName: menu.menuName,
        price: menu.price,
      });

      await this.createMenuSnapshotItems(
        tx,
        snap.id,
        menu.dishes,
        restaurantId
      );
    }

    return snapshotIds;
  }

  private async createMenuSnapshotItems(
    tx: Transaction,
    snapshotId: number,
    dishes: Dish[],
    restaurantId: number
  ): Promise<void> {
    let position = 1;

    for (const dish of dishes) {
      if (!dish.dishId || !dish.dishName || !dish.dishTypeId) continue;

      await tx.insert(snapshotItem).values({
        snapshotId,
        originalDishId: dish.dishId,
        dishName: dish.dishName,
        dishTypeId: dish.dishTypeId,
        restaurantId,
        position: position++,
      });
    }
  }

  private async createPostsForSnapshots(
    tx: Transaction,
    settings: {
      scheduleSettings: typeof scheduleSettings.$inferSelect;
      socialAccount: typeof socialMediaAccount.$inferSelect;
    }[],
    snapshotIds: number[]
  ): Promise<void> {
    for (const setting of settings) {
      const [newPost] = await tx
        .insert(post)
        .values({
          socialMediaAccountId: setting.socialAccount.id,
          status: 'SCHEDULED',
          scheduleSettingsId: setting.scheduleSettings.id,
          content: setting.scheduleSettings.contentText,
          scheduledAt: this.getNextScheduledAt(
            setting.scheduleSettings.cronExpression
          ),
        })
        .returning();

      await this.associateSnapshotsWithPost(tx, newPost.id, snapshotIds);
    }
  }

  private async associateSnapshotsWithPost(
    tx: Transaction,
    postId: number,
    snapshotIds: number[]
  ): Promise<void> {
    await tx.insert(postSnapshot).values(
      snapshotIds.map(snapshotId => ({
        postId,
        snapshotId,
      }))
    );
  }

  getNextScheduledAt(cronExpression: string): string {
    try {
      // Parse the cron expression with timezone support
      const interval = CronExpressionParser.parse(cronExpression);

      // Get the next execution time
      const next = interval.next().toISOString();
      if (!next) {
        throw new Error('No next execution time found');
      }
      return next;
    } catch (error) {
      throw new Error(
        `Invalid cron expression: ${cronExpression}. Error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
  async cancelScheduledWeek(dateRange: DateRange, restaurantId: number) {
    const { start: startOfWeek, end: endOfWeek, year, weekNumber } = dateRange;

    this.logger.log(
      `Cancelling scheduled week from ${startOfWeek} to ${endOfWeek} for restaurant ID ${restaurantId}`
    );

    const existing = await this.weekScheduleService.getExistingSchedules(
      dateRange,
      restaurantId
    );

    await this.databaseService.db.transaction(async tx => {
      // Fetch snapshots for this restaurant and week that are scheduled
      const snapshots = await tx
        .select()
        .from(snapshot)
        .where(
          and(
            eq(snapshot.restaurantId, restaurantId),
            between(snapshot.date, startOfWeek, endOfWeek)
          )
        );

      if (snapshots.length === 0) {
        throw new BadRequestException(
          `No scheduled snapshots found for week ${year}-${weekNumber}`
        );
      }

      const snapshotIds = snapshots.map(s => s.id);

      // Delete related entries first due to foreign key constraints
      await tx
        .delete(snapshotItem)
        .where(inArray(snapshotItem.snapshotId, snapshotIds));
      await tx
        .delete(snapshotMenu)
        .where(inArray(snapshotMenu.snapshotId, snapshotIds));
      await tx
        .delete(snapshotOffer)
        .where(inArray(snapshotOffer.snapshotId, snapshotIds));

      // Delete snapshots themselves
      await tx.delete(snapshot).where(inArray(snapshot.id, snapshotIds));
      // Since CASCADE is set up, related postSnapshots will be deleted automatically

      const postIds = existing.posts.map(p => p.postId);
      await tx
        .delete(post)
        .where(and(eq(post.status, 'SCHEDULED'), inArray(post.id, postIds)));

      this.logger.log(
        `Deleted ${snapshots.length} scheduled snapshot(s) for week ${year}-${weekNumber}`
      );
    });
  }

  private dayTimeToCron(day: DayName, time: string): string {
    const [hour, minute] = time.split(':');
    const dayOfWeekMap: Record<DayName, number> = {
      SATURDAY: 6,
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
    };
    return `${minute} ${hour} * * ${dayOfWeekMap[day]}`;
  }

  private cronToDayTime(cronExpression: string): {
    postDay: DayName;
    postTime: string;
  } {
    try {
      const parts = cronExpression.split(' ');
      const minute = parts[0].padStart(2, '0');
      const hour = parts[1].padStart(2, '0');
      const dayOfWeek = Number.parseInt(parts[4], 10);

      const dayMap: { [key: number]: DayName } = {
        6: 'SATURDAY',
        0: 'SUNDAY',
        1: 'MONDAY',
      };

      if (!(dayOfWeek in dayMap)) {
        throw new Error('Unsupported day of week in cron expression');
      }

      return {
        postDay: dayMap[dayOfWeek],
        postTime: `${hour}:${minute}`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to parse cron expression: ${cronExpression}`,
        error
      );
      // Return a sensible default if parsing fails
      return { postDay: 'MONDAY', postTime: '18:00' };
    }
  }
}
