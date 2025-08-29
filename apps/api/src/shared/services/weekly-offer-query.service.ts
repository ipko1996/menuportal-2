import { Injectable } from '@nestjs/common';
import { and, between, eq } from 'drizzle-orm';

import { WeekMenuResponseDto } from '@/modules/week-menu/dto/week-menu-response.dto';
import { availability, dish, dishMenu, dishType, menu, offer } from '@/schema';

import { DatabaseService } from '../database/database.service';
import { DateRange } from '../pipes';

@Injectable()
export class WeeklyOfferQueryService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getWeeklyData(
    dateRange: { start: string; end: string },
    restaurantId: number
  ) {
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

    return { weeklyOffers, weeklyMenus };
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  async getWeeklyDataForWeek(
    dateRange: DateRange,
    restaurantId: number
  ): Promise<WeekMenuResponseDto['days']> {
    const { start: startOfWeek, end: endOfWeek } = dateRange;

    const { weeklyOffers, weeklyMenus } = await this.getWeeklyData(
      { start: startOfWeek, end: endOfWeek },
      restaurantId
    );

    const days: WeekMenuResponseDto['days'] = {};
    for (
      let d = new Date(startOfWeek);
      d <= new Date(endOfWeek);
      d.setDate(d.getDate() + 1)
    ) {
      const key = d.toISOString().slice(0, 10);
      days[key] = { offers: [], menus: [] };
    }

    for (const o of weeklyOffers) {
      if (!o.availabilityDate) {
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

    for (const m of weeklyMenus) {
      const key = m.availabilityDate?.slice(0, 10);
      if (!key) {
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

    return days;
  }
}
