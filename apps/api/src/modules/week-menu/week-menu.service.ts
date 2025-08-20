import { Injectable, Logger } from '@nestjs/common';
import {
  addWeeks,
  isBefore,
  isSameWeek,
  parseISO,
  startOfISOWeek,
} from 'date-fns';
import { and, between, eq, is } from 'drizzle-orm';

import {
  availability,
  dish,
  dishMenu,
  dishType,
  menu,
  MenuStatusApi,
  offer,
  snapshot,
  snapshotItem,
  snapshotMenu,
  snapshotOffer,
} from '@/schema';
import { DatabaseService } from '@/shared/database/database.service';
import type { DateRange } from '@/shared/pipes/week-to-date-range.pipe';

import { WeekScheduleService } from '../week-schedule/week-schedule.service';
import { WeekMenuResponseDto } from './dto/week-menu-response.dto';

// Interfaces remain the same as they define the shape of the data from the database
interface WeeklyMenu {
  menuId: number;
  menuName: string;
  menuPrice: number;
  menuCreatedAt: string;
  dishId: number | null;
  dishName: string | null;
  dishTypeId: number | null;
  availabilityDate: string | null;
  availabilityEntityType: 'MENU' | 'OFFER' | null;
}

interface WeeklyOffer {
  offerId: number;
  offerPrice: number;
  offerCreatedAt: string;
  dishId: number | null;
  dishName: string | null;
  dishTypeId: number | null;
  availabilityDate: string | null;
  availabilityEntityType: 'MENU' | 'OFFER' | null;
}

@Injectable()
export class WeekMenuService {
  private readonly logger = new Logger(WeekMenuService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly weekScheduleService: WeekScheduleService
  ) {}

  private isWeekEmpty(days: WeekMenuResponseDto['days']): boolean {
    return Object.values(days).every(
      day => day.offers.length === 0 && day.menus.length === 0
    );
  }

  /**
   * Returns the full weekly menu response, including status and week boundaries.
   * @param dateRange The start and end dates for the week.
   * @param restaurantId The ID of the restaurant.
   * @returns A promise that resolves to the weekly menu response DTO.
   */
  async getMenusForWeek(
    dateRange: DateRange,
    restaurantId: number
  ): Promise<WeekMenuResponseDto> {
    this.logger.log(
      `Fetching menus for week: ${dateRange.start} to ${dateRange.end}`
    );

    const existingSchedules =
      await this.weekScheduleService.getExistingSchedules(
        dateRange,
        restaurantId
      );

    const now = new Date();
    const { start, end } = dateRange;
    const weekStart = parseISO(start);
    const weekEnd = parseISO(end);

    let weekStatus: MenuStatusApi;
    let days: WeekMenuResponseDto['days'];
    const isPast = isBefore(weekEnd, now);
    const isCurrentWeek = isSameWeek(weekStart, now, { weekStartsOn: 1 });
    const isPlanningWeek = isSameWeek(
      weekStart,
      startOfISOWeek(addWeeks(now, 1)),
      { weekStartsOn: 1 }
    );

    if (existingSchedules.length > 0) {
      this.logger.warn(
        `Week ${start} to ${end} is already scheduled, published, or failed for restaurant ${restaurantId}`
      );

      days = this.transformSchedulesToDays(existingSchedules, dateRange);

      // Determine the week's status with priority: PUBLISHED > FAILED > SCHEDULED
      // Theoretically, either all schedules are PUBLISHED or FAILED because of transactional nature.
      if (existingSchedules.some(s => s.status === 'PUBLISHED')) {
        weekStatus = 'PUBLISHED';
      } else if (existingSchedules.some(s => s.status === 'FAILED')) {
        weekStatus = 'FAILED';
      } else {
        weekStatus = 'SCHEDULED';
      }
    } else {
      // Logic for 'DRAFT' weeks
      weekStatus = 'DRAFT';
      days = await this.getWeekDays(dateRange, restaurantId);
    }

    return {
      weekStatus,
      weekStart: start,
      weekEnd: end,
      days,
      isEmpty: this.isWeekEmpty(days),
      isPast,
      isCurrentWeek,
      isPlanningWeek,
    };
  }

  /**
   * Transforms snapshot data into the week menu response format.
   * @param schedules An array of schedule data from the database.
   * @param dateRange The start and end dates for the week.
   * @returns The structured days object for the WeekMenuResponseDto.
   */
  private transformSchedulesToDays(
    schedules: (typeof snapshot.$inferSelect & {
      offers: (typeof snapshotOffer.$inferSelect)[];
      menus: (typeof snapshotMenu.$inferSelect)[];
      items: (typeof snapshotItem.$inferSelect)[];
    })[],
    dateRange: DateRange
  ): WeekMenuResponseDto['days'] {
    const days = this.initializeDays(dateRange.start, dateRange.end);

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

    return days;
  }

  /**
   * Fetches and processes menus and offers for a given week, returning a structured object of days.
   * This public method can be reused elsewhere.
   * @param dateRange The start and end dates for the week.
   * @param restaurantId The ID of the restaurant.
   * @returns A promise that resolves to the structured days object.
   */
  async getWeekDays(
    dateRange: DateRange,
    restaurantId: number
  ): Promise<WeekMenuResponseDto['days']> {
    const { start: startOfWeek, end: endOfWeek } = dateRange;

    // The core data fetching logic is now within this method.
    const [weeklyOffers, weeklyMenus] = await Promise.all([
      this.databaseService.db
        .select({
          offerId: offer.id,
          offerPrice: offer.price,
          offerCreatedAt: offer.createdAt,
          dishId: dish.id,
          dishName: dish.dishName,
          dishTypeId: dish.dishTypeId,
          availabilityDate: availability.date,
          availabilityEntityType: availability.entityType,
        })
        .from(offer)
        .leftJoin(dish, eq(offer.dishId, dish.id))
        .leftJoin(
          availability,
          and(
            eq(availability.entityId, offer.id),
            eq(availability.entityType, 'OFFER')
          )
        )
        .where(
          and(
            eq(offer.restaurantId, restaurantId),
            between(availability.date, startOfWeek, endOfWeek)
          )
        ),

      this.databaseService.db
        .select({
          menuId: menu.id,
          menuName: menu.menuName,
          menuPrice: menu.price,
          menuCreatedAt: menu.createdAt,
          dishId: dish.id,
          dishName: dish.dishName,
          dishTypeId: dish.dishTypeId,
          availabilityDate: availability.date,
          availabilityEntityType: availability.entityType,
        })
        .from(menu)
        .leftJoin(dishMenu, eq(menu.id, dishMenu.menuId))
        .leftJoin(dish, eq(dishMenu.dishId, dish.id))
        .leftJoin(dishType, eq(dish.dishTypeId, dishType.id))
        .leftJoin(
          availability,
          and(
            eq(availability.entityId, menu.id),
            eq(availability.entityType, 'MENU')
          )
        )
        .where(
          and(
            eq(menu.restaurantId, restaurantId),
            between(availability.date, startOfWeek, endOfWeek)
          )
        ),
    ]);

    const days: WeekMenuResponseDto['days'] = this.initializeDays(
      startOfWeek,
      endOfWeek
    );

    // Processing logic remains the same, called from this new method.
    this.processWeeklyOffers(weeklyOffers, days);
    this.processWeeklyMenus(weeklyMenus, days);

    return days;
  }

  /**
   * Initializes a 'days' object with empty menus and offers for each day in the date range.
   * @param startOfWeek The starting date string (YYYY-MM-DD).
   * @param endOfWeek The ending date string (YYYY-MM-DD).
   * @returns The initialized days object.
   */
  private initializeDays(
    startOfWeek: string,
    endOfWeek: string
  ): WeekMenuResponseDto['days'] {
    const days: WeekMenuResponseDto['days'] = {};
    for (
      let d = new Date(startOfWeek);
      d <= new Date(endOfWeek);
      d.setDate(d.getDate() + 1)
    ) {
      const key = d.toISOString().slice(0, 10);
      days[key] = { offers: [], menus: [] };
    }
    return days;
  }

  /**
   * Processes the raw weekly offer data and populates the 'days' object.
   * @param weeklyOffers An array of offer data from the database.
   * @param days The days object to populate.
   */
  private processWeeklyOffers(
    weeklyOffers: WeeklyOffer[],
    days: WeekMenuResponseDto['days']
  ) {
    for (const o of weeklyOffers) {
      if (!o.availabilityDate) {
        this.logger.warn(
          `Offer with ID ${o.offerId} has no availability date, skipping.`
        );
        continue;
      }
      const key = o.availabilityDate?.slice(0, 10);
      if (days[key]) {
        days[key].offers.push({
          offerId: o.offerId,
          dish: {
            dishId: o.dishId,
            dishName: o.dishName,
            dishTypeId: o.dishTypeId,
          },
          price: o.offerPrice,
        });
      }
    }
  }

  /**
   * Processes the raw weekly menu data and populates the 'days' object, grouping dishes by menu.
   * @param weeklyMenus An array of menu data from the database.
   * @param days The days object to populate.
   */
  private processWeeklyMenus(
    weeklyMenus: WeeklyMenu[],
    days: WeekMenuResponseDto['days']
  ) {
    for (const m of weeklyMenus) {
      const key = m.availabilityDate?.slice(0, 10);
      if (!key) {
        this.logger.warn(
          `Menu with ID ${m.menuId} has no availability date, skipping.`
        );
        continue;
      }
      if (days[key]) {
        let menuEntry = days[key].menus.find(menu => menu.menuId === m.menuId);
        if (!menuEntry) {
          menuEntry = {
            menuId: m.menuId,
            menuName: m.menuName,
            price: m.menuPrice,
            dishes: [],
          };
          days[key].menus.push(menuEntry);
        }
        if (m.dishId && m.dishName) {
          menuEntry.dishes.push({
            dishId: m.dishId,
            dishName: m.dishName,
            dishTypeId: m.dishTypeId,
          });
        }
      }
    }
  }
}
