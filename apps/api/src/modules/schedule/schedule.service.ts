import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { and, between, eq, inArray } from 'drizzle-orm';

import { snapshot, snapshotItem, snapshotMenu, snapshotOffer } from '@/schema';
import { DatabaseService } from '@/shared/database/database.service';
import { DateRange } from '@/shared/pipes';

import { WeekMenuService } from '../week-menu/week-menu.service';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly weekMenuService: WeekMenuService
  ) {}

  async scheduleWeek(dateRange: DateRange, restaurantId: number) {
    const { start: startOfWeek, end: endOfWeek, year, weekNumber } = dateRange;

    this.logger.log(
      `Scheduling from ${startOfWeek} to ${endOfWeek} for restaurant ID ${restaurantId}`
    );

    const existing = await this.databaseService.db
      .select()
      .from(snapshot)
      .where(
        and(
          eq(snapshot.restaurantId, restaurantId),
          between(snapshot.date, startOfWeek, endOfWeek),
          inArray(snapshot.status, ['SCHEDULED', 'PUBLISHED'])
        )
      );

    if (existing.length > 0) {
      throw new BadRequestException(
        `Week ${year}-${weekNumber} is already scheduled or published for restaurant ${restaurantId}`
      );
    }

    const days = await this.weekMenuService.getWeekDays(
      dateRange,
      restaurantId
    );

    this.logger.log(
      `Saving weekly menus and daily menu items for week: ${year}-${weekNumber}`
    );

    await this.databaseService.db.transaction(async tx => {
      for (const [day, dayData] of Object.entries(days)) {
        // --- Save offers ---
        for (const offer of dayData.offers) {
          const [snap] = await tx
            .insert(snapshot)
            .values({
              restaurantId,
              entityType: 'OFFER',
              originalId: offer.offerId,
              date: day,
              status: 'SCHEDULED',
            })
            .returning();

          await tx.insert(snapshotOffer).values({
            snapshotId: snap.id,
            originalOfferId: offer.offerId,
            price: offer.price,
          });

          if (
            !offer.dish.dishId ||
            !offer.dish.dishName ||
            !offer.dish.dishTypeId
          ) {
            continue;
          }
          await tx.insert(snapshotItem).values({
            snapshotId: snap.id,
            originalDishId: offer.dish.dishId,
            dishName: offer.dish.dishName,
            dishTypeId: offer.dish.dishTypeId,
            restaurantId,
            position: 1,
          });
        }

        // --- Save menus ---
        for (const menu of dayData.menus) {
          const [snap] = await tx
            .insert(snapshot)
            .values({
              restaurantId,
              entityType: 'MENU',
              originalId: menu.menuId,
              date: day,
              status: 'SCHEDULED',
            })
            .returning();

          await tx.insert(snapshotMenu).values({
            snapshotId: snap.id,
            originalMenuId: menu.menuId,
            menuName: menu.menuName,
            price: menu.price,
          });

          let pos = 1;
          for (const dish of menu.dishes) {
            if (!dish.dishId || !dish.dishName || !dish.dishTypeId) continue;
            await tx.insert(snapshotItem).values({
              snapshotId: snap.id,
              originalDishId: dish.dishId,
              dishName: dish.dishName,
              dishTypeId: dish.dishTypeId,
              restaurantId,
              position: pos++,
            });
          }
        }
      }
    });
  }

  async cancelScheduledWeek(dateRange: DateRange, restaurantId: number) {
    const { start: startOfWeek, end: endOfWeek, year, weekNumber } = dateRange;

    this.logger.log(
      `Cancelling scheduled week from ${startOfWeek} to ${endOfWeek} for restaurant ID ${restaurantId}`
    );

    await this.databaseService.db.transaction(async tx => {
      // Fetch snapshots for this restaurant and week that are scheduled
      const snapshots = await tx
        .select()
        .from(snapshot)
        .where(
          and(
            eq(snapshot.restaurantId, restaurantId),
            between(snapshot.date, startOfWeek, endOfWeek),
            inArray(snapshot.status, ['SCHEDULED', 'DRAFT'])
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

      this.logger.log(
        `Deleted ${snapshots.length} scheduled snapshot(s) for week ${year}-${weekNumber}`
      );
    });
  }
}
