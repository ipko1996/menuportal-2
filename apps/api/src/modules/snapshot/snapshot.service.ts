/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { and, between, eq, inArray } from 'drizzle-orm';

import { snapshot, snapshotItem, snapshotMenu, snapshotOffer } from '@/schema';
import {
  DatabaseService,
  Transaction,
} from '@/shared/database/database.service';
import { DateRange } from '@/shared/pipes';
import { WeeklyOfferQueryService } from '@/shared/services/weekly-offer-query.service';

import { WeekMenuResponseDto } from '../week-menu/dto/week-menu-response.dto';

@Injectable()
export class SnapshotService {
  private readonly logger = new Logger(SnapshotService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly weeklyOfferQueryService: WeeklyOfferQueryService
  ) {}

  private async checkSnapshotsExist(
    dateRange: DateRange,
    restaurantId: number
  ): Promise<boolean> {
    const { start, end } = dateRange;
    const exists = await this.databaseService.db
      .select()
      .from(snapshot)
      .where(
        and(
          eq(snapshot.restaurantId, restaurantId),
          between(snapshot.date, start, end)
        )
      )
      .limit(1);

    return exists.length > 0;
  }

  public async createSnapshots(
    dateRange: DateRange,
    restaurantId: number,
    tx: Transaction
  ): Promise<number[]> {
    const { start: startOfWeek, end: endOfWeek, year, weekNumber } = dateRange;
    this.logger.log(startOfWeek, endOfWeek, year, weekNumber);

    // Check if snapshots already exist for the given date range and restaurant
    const exists = await this.checkSnapshotsExist(dateRange, restaurantId);

    this.logger.debug({
      message: 'Checking if snapshots exist',
      exists,
      dateRange,
      restaurantId,
    });

    if (exists) {
      this.logger.warn(
        `Snapshots already exist for restaurant ID ${restaurantId} in the specified date range. Skipping creation.`
      );
      throw new ConflictException(
        'Snapshots already exist for the specified date range.'
      );
    }

    // Get the weekly data using the existing service
    const weeklyData = await this.weeklyOfferQueryService.getWeeklyData(
      { start: startOfWeek, end: endOfWeek },
      restaurantId
    );

    // Check if weeklyData has any offers or menus
    const hasItems = Object.values(weeklyData).some(day => day.length > 0);
    if (!hasItems) {
      throw new BadRequestException(
        `No menus or offers found to schedule for week ${year}-${weekNumber}`
      );
    }

    this.logger.debug({
      message: 'Weekly data fetched for snapshot creation',
      weeklyData,
      hasItems,
    });

    const snapshotIds: number[] = [];

    await tx.transaction(async tx => {
      // --- Offers ---
      if (weeklyData.weeklyOffers.length === 0) {
        // Skip offers processing
      } else {
        const offerSnapshots = await tx
          .insert(snapshot)
          .values(
            weeklyData.weeklyOffers.map(o => ({
              restaurantId,
              entityType: 'OFFER' as const,
              originalId: o.offerId,
              date: o.availabilityDate!,
            }))
          )
          .returning({ id: snapshot.id, originalId: snapshot.originalId });

        const offerSnapshotMap = new Map(
          offerSnapshots.map(s => [s.originalId, s.id])
        );
        snapshotIds.push(...offerSnapshots.map(s => s.id));

        await tx.insert(snapshotOffer).values(
          weeklyData.weeklyOffers.map(o => ({
            snapshotId: offerSnapshotMap.get(o.offerId)!,
            originalOfferId: o.offerId,
            price: o.offerPrice,
          }))
        );

        await tx.insert(snapshotItem).values(
          weeklyData.weeklyOffers.map(o => ({
            snapshotId: offerSnapshotMap.get(o.offerId)!,
            originalDishId: o.dishId!,
            dishName: o.dishName!,
            dishTypeId: o.dishTypeId!,
            restaurantId,
          }))
        );
      }

      // --- Menus ---
      if (weeklyData.weeklyMenus.length === 0) {
        return; // Early return - no menus to process
      }

      // Step 1: snapshots
      const menuSnapshots = await tx
        .insert(snapshot)
        .values(
          weeklyData.weeklyMenus.map(m => ({
            restaurantId,
            entityType: 'MENU' as const,
            originalId: m.menuId,
            date: m.availabilityDate!,
          }))
        )
        .returning({ id: snapshot.id, originalId: snapshot.originalId });

      const menuSnapshotMap = new Map(
        menuSnapshots.map(s => [s.originalId, s.id])
      );
      snapshotIds.push(...menuSnapshots.map(s => s.id));

      // Step 2: unique snapshotMenu rows
      const uniqueMenus = Object.values(
        weeklyData.weeklyMenus.reduce<
          Record<string, (typeof weeklyData.weeklyMenus)[0]>
        >((acc, m) => {
          acc[m.menuId] ??= m;
          return acc;
        }, {})
      );

      await tx.insert(snapshotMenu).values(
        uniqueMenus.map(m => ({
          snapshotId: menuSnapshotMap.get(m.menuId)!,
          originalMenuId: m.menuId,
          menuName: m.menuName,
          price: m.menuPrice,
        }))
      );

      // Step 3: snapshotItems (all dishes in menus)
      await tx.insert(snapshotItem).values(
        weeklyData.weeklyMenus.map(m => ({
          snapshotId: menuSnapshotMap.get(m.menuId)!,
          originalDishId: m.dishId!,
          dishName: m.dishName!,
          dishTypeId: m.dishTypeId!,
          restaurantId,
        }))
      );
    });

    return snapshotIds;
  }

  public async getSnapshots(dateRange: DateRange, restaurantId: number) {
    const { start: startOfWeek, end: endOfWeek } = dateRange;
    const exists = await this.checkSnapshotsExist(dateRange, restaurantId);
    if (!exists) {
      this.logger.warn(
        `No snapshots found for restaurant ID ${restaurantId} in the specified date range.`
      );
      return [];
    }

    return await this.databaseService.db.query.snapshot.findMany({
      where: and(
        eq(snapshot.restaurantId, restaurantId),
        between(snapshot.date, startOfWeek, endOfWeek)
      ),
      with: {
        offers: true,
        menus: true,
        items: true,
      },
    });
  }

  public async deleteSnapshots(
    dateRange: DateRange,
    restaurantId: number,
    tx: Transaction
  ): Promise<number[]> {
    const { start, end, year, weekNumber } = dateRange;
    const snapshots = await tx
      .select()
      .from(snapshot)
      .where(
        and(
          eq(snapshot.restaurantId, restaurantId),
          between(snapshot.date, start, end)
        )
      );

    if (snapshots.length === 0) {
      throw new BadRequestException(
        `No scheduled snapshots found for week ${year}-${weekNumber}`
      );
    }
    const snapshotIds = snapshots.map(s => s.id);

    await tx
      .delete(snapshotItem)
      .where(inArray(snapshotItem.snapshotId, snapshotIds));
    await tx
      .delete(snapshotMenu)
      .where(inArray(snapshotMenu.snapshotId, snapshotIds));
    await tx
      .delete(snapshotOffer)
      .where(inArray(snapshotOffer.snapshotId, snapshotIds));

    await tx.delete(snapshot).where(inArray(snapshot.id, snapshotIds));

    return snapshotIds;
  }

  public async getSnapshotsForWeek(
    dateRange: DateRange,
    restaurantId: number
  ): Promise<{ days: WeekMenuResponseDto['days']; snaps: number[] }> {
    const { start: startOfWeek, end: endOfWeek } = dateRange;
    const schedules = await this.getSnapshots(dateRange, restaurantId);

    const days: WeekMenuResponseDto['days'] = {};

    for (
      let d = new Date(startOfWeek);
      d <= new Date(endOfWeek);
      d.setDate(d.getDate() + 1)
    ) {
      const key = d.toISOString().slice(0, 10);
      days[key] = { offers: [], menus: [] };
    }

    for (const schedule of schedules) {
      // A null originalId indicates invalid data, so we still skip those.
      if (!schedule.originalId) {
        this.logger.warn(
          `Skipping schedule with ID ${schedule.id} due to missing originalId.`
        );
        continue;
      }

      const dayKey = schedule.date;
      if (!days[dayKey]) continue;

      if (schedule.entityType === 'OFFER') {
        const offerData = schedule.offers[0];
        const dishData = schedule.items[0];

        if (!offerData || !dishData) {
          this.logger.error(
            `Incomplete snapshot data for offer with original ID ${schedule.originalId}`
          );
          continue;
        }

        days[dayKey].offers.push({
          offerId: schedule.originalId,
          price: offerData.price,
          dish: {
            dishId: dishData.originalDishId,
            dishName: dishData.dishName,
            dishTypeId: dishData.dishTypeId,
          },
        });
      } else if (schedule.entityType === 'MENU') {
        const menuData = schedule.menus[0];
        if (!menuData) {
          this.logger.error(
            `Incomplete snapshot data for menu with original ID ${schedule.originalId}`
          );
          continue;
        }

        days[dayKey].menus.push({
          menuId: schedule.originalId,
          menuName: menuData.menuName,
          price: menuData.price,
          dishes: schedule.items.map(item => ({
            dishId: item.originalDishId,
            dishName: item.dishName,
            dishTypeId: item.dishTypeId,
          })),
        });
      }
    }

    return { days, snaps: schedules.map(s => s.id) };
  }
}
