import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';

// ✨ Import both table schemas
import { restaurant, restaurantSetting } from '@/schema';
import { DatabaseService } from '@/shared/database/database.service';

import { UpdateRestaurantSettingDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantSettingsService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Finds a single restaurant and its settings by joining the two tables.
   */
  async findOne(restaurantId: number) {
    // ✨ Query now joins restaurant with restaurant_setting
    const result = await this.databaseService.db
      .select({
        id: restaurant.id,
        name: restaurant.name,
        phoneNumber: restaurant.phoneNumber,
        address: restaurant.address,
        menuPrice: restaurantSetting.menuPrice,
        takeawayPrice: restaurantSetting.takeawayPrice,
      })
      .from(restaurant)
      // ✨ Use LEFT JOIN instead of INNER JOIN
      .leftJoin(
        restaurantSetting,
        eq(restaurant.id, restaurantSetting.restaurantId)
      )
      .where(eq(restaurant.id, restaurantId))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException(
        `Restaurant with ID "${restaurantId}" not found.`
      );
    }

    // result[0] will now contain the restaurant data,
    // with menuPrice and takeawayPrice being null if no settings exist.
    return result[0];
  }

  /**
   * Updates restaurant and/or its settings in a single transaction.
   */
  async update(
    updateRestaurantDto: UpdateRestaurantSettingDto,
    restaurantId: number
  ) {
    // The transaction is essential for this multi-step operation
    return this.databaseService.db.transaction(async tx => {
      // 1. Confirm the restaurant exists (no changes here)
      const existingRestaurant = await tx
        .select({ id: restaurant.id })
        .from(restaurant)
        .where(eq(restaurant.id, restaurantId))
        .limit(1);

      if (existingRestaurant.length === 0) {
        throw new NotFoundException(
          `Restaurant with ID "${restaurantId}" not found.`
        );
      }

      // 2. Separate DTO properties for each table (no changes here)
      const { name, phoneNumber, address, menuPrice, takeawayPrice } =
        updateRestaurantDto;

      const restaurantData: Partial<typeof restaurant.$inferInsert> = {};
      const settingsData: Partial<typeof restaurantSetting.$inferInsert> = {};

      if (name) restaurantData.name = name;
      if (phoneNumber) restaurantData.phoneNumber = phoneNumber;
      if (address) restaurantData.address = address;

      if (menuPrice !== undefined) settingsData.menuPrice = menuPrice;
      if (takeawayPrice !== undefined)
        settingsData.takeawayPrice = takeawayPrice;

      // 3. Update the 'restaurant' table if there is data for it (no changes here)
      if (Object.keys(restaurantData).length > 0) {
        await tx
          .update(restaurant)
          .set(restaurantData)
          .where(eq(restaurant.id, restaurantId));
      }

      // 4. ✨ REFACTORED: Upsert the 'restaurant_setting' table
      if (Object.keys(settingsData).length > 0) {
        await tx
          .insert(restaurantSetting)
          .values({
            restaurantId,
            ...settingsData,
          })
          .onConflictDoUpdate({
            target: restaurantSetting.restaurantId,
            set: settingsData,
          });
      }

      // 5. Re-fetch and return the combined data using the LEFT JOIN
      const [updatedData] = await tx
        .select({
          id: restaurant.id,
          name: restaurant.name,
          phoneNumber: restaurant.phoneNumber,
          address: restaurant.address,
          menuPrice: restaurantSetting.menuPrice,
          takeawayPrice: restaurantSetting.takeawayPrice,
        })
        .from(restaurant)
        .leftJoin(
          // Ensure we use LEFT JOIN here as well
          restaurantSetting,
          eq(restaurant.id, restaurantSetting.restaurantId)
        )
        .where(eq(restaurant.id, restaurantId))
        .limit(1);

      return updatedData;
    });
  }
}
