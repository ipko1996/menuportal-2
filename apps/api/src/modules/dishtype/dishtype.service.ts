import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { and, eq, inArray, sql } from 'drizzle-orm';

import { dishType, restaurantDishType } from '@/schema';
import { DatabaseService } from '@/shared/database/database.service';

@Injectable()
export class DishtypeService {
  private readonly logger = new Logger(DishtypeService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    return await this.databaseService.db
      .select({
        id: dishType.id,
        name: dishType.dishTypeName,
        dishTypeValue: dishType.dishTypeValue,
      })
      .from(dishType)
      .where(eq(dishType.enabled, true));
  }

  async upsertDishTypesForRestaurant(
    data: { id: number; price: number }[],
    restaurantId: number
  ) {
    if (!data || data.length === 0) {
      return;
    }

    const dishTypeIds = data.map(item => item.id);

    // ## 1. Validate Dish Types
    // First, check if all provided dish type IDs are valid (exist) and active (enabled).
    const validDishTypes = await this.databaseService.db
      .select({ id: dishType.id })
      .from(dishType)
      .where(
        and(inArray(dishType.id, dishTypeIds), eq(dishType.enabled, true))
      );

    // If the count of valid dish types doesn't match the input, find the invalid ones and throw an error.
    if (validDishTypes.length !== dishTypeIds.length) {
      const validIdSet = new Set(validDishTypes.map(dt => dt.id));
      const invalidIds = dishTypeIds.filter(id => !validIdSet.has(id));
      throw new BadRequestException(
        `The following dish type IDs are either invalid or disabled: ${invalidIds.join(
          ', '
        )}`
      );
    }

    // ## 2. Prepare Data for Upsert
    // Map the input data to the format required by the 'restaurantDishType' table schema.
    const dataToInsert = data.map(item => ({
      dishTypeId: item.id,
      restaurantId,
      price: item.price,
    }));

    // ## 3. Execute Upsert Operation
    // Insert the new data. If a row with the same 'restaurantId' and 'dishTypeId'
    // already exists (a conflict on the unique constraint), update its 'price'.
    await this.databaseService.db
      .insert(restaurantDishType)
      .values(dataToInsert)
      .onConflictDoUpdate({
        // The target must be the columns of the unique constraint.
        target: [
          restaurantDishType.restaurantId,
          restaurantDishType.dishTypeId,
        ],
        // Set the price to the value from the new data that was attempted to be inserted.
        set: {
          price: sql`excluded.price`,
        },
      });
  }
}
