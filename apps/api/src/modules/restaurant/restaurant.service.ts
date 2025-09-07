import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { restaurant } from '@/schema';
import { DatabaseService } from '@/shared/database/database.service';

import { UpdateRestaurantSettingDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantSettingsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findOne(restaurantId: number) {
    const result = await this.databaseService.db
      .select({
        id: restaurant.id,
        name: restaurant.name,
        phoneNumber: restaurant.phoneNumber,
        address: restaurant.address,
        takeawayPrice: restaurant.takeawayPrice,
      })
      .from(restaurant)
      .where(eq(restaurant.id, restaurantId))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException(
        `Restaurant with ID "${restaurantId}" not found.`
      );
    }

    return result[0];
  }

  async update(
    updateRestaurantDto: UpdateRestaurantSettingDto,
    restaurantId: number
  ) {
    // First, ensure the restaurant exists
    await this.findOne(restaurantId);

    // If the DTO is empty, there's nothing to update.
    if (Object.keys(updateRestaurantDto).length === 0) {
      return this.findOne(restaurantId);
    }

    const [updatedRestaurant] = await this.databaseService.db
      .update(restaurant)
      .set({
        ...updateRestaurantDto,
      })
      .where(eq(restaurant.id, restaurantId))
      .returning({
        id: restaurant.id,
        name: restaurant.name,
        phoneNumber: restaurant.phoneNumber,
        address: restaurant.address,
        takeawayPrice: restaurant.takeawayPrice,
      });

    return updatedRestaurant;
  }
}
