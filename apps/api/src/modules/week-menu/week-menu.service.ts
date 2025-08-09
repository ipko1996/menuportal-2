import { Injectable, Logger } from '@nestjs/common';
import { and, between, eq } from 'drizzle-orm';

import { availability, dish, dishMenu, dishType, menu, offer } from '@/schema';
import { DatabaseService } from '@/shared/database/database.service';
import type { DateRange } from '@/shared/pipes/week-to-date-range.pipe';

import { WeekMenuResponseDto } from './dto/week-menu-response.dto';

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

  constructor(private readonly databaseService: DatabaseService) {}

  async getMenusForWeek(
    dateRange: DateRange,
    restaurantId: number
  ): Promise<WeekMenuResponseDto> {
    this.logger.log(
      `Fetching menus for week: ${dateRange.start} to ${dateRange.end}`
    );
    const { start: startOfWeek, end: endOfWeek } = dateRange;

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

    this.processWeeklyOffers(weeklyOffers, days);
    this.processWeeklyMenus(weeklyMenus, days);

    return {
      weekStart: startOfWeek,
      weekEnd: endOfWeek,
      days,
    };
  }

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
