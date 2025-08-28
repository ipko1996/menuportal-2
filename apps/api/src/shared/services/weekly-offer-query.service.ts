import { Injectable } from '@nestjs/common';
import { and, between, eq } from 'drizzle-orm';

import { availability, dish, dishMenu, dishType, menu, offer } from '@/schema';

import { DatabaseService } from '../database/database.service';

@Injectable()
export class WeeklyOfferQueryService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getWeeklyData(
    dateRange: { start: string; end: string },
    restaurantId: number
  ) {
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

    return { weeklyOffers, weeklyMenus };
  }
}
