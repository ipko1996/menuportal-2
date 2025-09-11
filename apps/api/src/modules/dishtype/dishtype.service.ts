import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { and, eq, inArray, sql } from 'drizzle-orm';

import { dishType, restaurantDishType } from '@/schema';
import { DatabaseService } from '@/shared/database/database.service';

import { DishTypeWithDataResponseDto } from './dto/dishtype-response.dto';
import { UpdateRestaurantDishTypesDto } from './dto/update-dish-type.dto';

@Injectable()
export class DishtypeService {
  private readonly logger = new Logger(DishtypeService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(restaurantId: number): Promise<DishTypeWithDataResponseDto[]> {
    return await this.databaseService.db
      .select({
        dishTypeId: dishType.id,
        name: dishType.dishTypeName,
        dishTypeValue: dishType.dishTypeValue,
        price: restaurantDishType.price,
        isActive: restaurantDishType.isActive,
        isOnTheMenu: restaurantDishType.isOnTheMenu,
      })
      .from(dishType)
      .innerJoin(
        restaurantDishType,
        eq(dishType.id, restaurantDishType.dishTypeId)
      )
      .where(
        and(
          eq(dishType.enabled, true),
          eq(restaurantDishType.isActive, true),
          eq(restaurantDishType.restaurantId, restaurantId)
        )
      );
  }

  async findAllEnabled() {
    return await this.databaseService.db
      .select({
        dishTypeId: dishType.id,
        name: dishType.dishTypeName,
        dishTypeValue: dishType.dishTypeValue,
      })
      .from(dishType)
      .where(eq(dishType.enabled, true));
  }

  async upsertDishTypesForRestaurant(
    dto: UpdateRestaurantDishTypesDto,
    restaurantId: number
  ) {
    return await this.databaseService.db.transaction(async tx => {
      const { settings } = dto;

      if (!settings || settings.length === 0) {
        return;
      }

      const dishTypeIds = settings.map(item => item.dishTypeId);

      const validDishTypes = await tx
        .select({ id: dishType.id })
        .from(dishType)
        .where(
          and(inArray(dishType.id, dishTypeIds), eq(dishType.enabled, true))
        );

      if (validDishTypes.length !== dishTypeIds.length) {
        const validIdSet = new Set(validDishTypes.map(dt => dt.id));
        const invalidIds = dishTypeIds.filter(id => !validIdSet.has(id));
        throw new BadRequestException(
          `The following dish type IDs are either invalid or disabled: ${invalidIds.join(
            ', '
          )}`
        );
      }

      // ## 2. Prepare Data for Upsert from the DTO
      const dataToUpsert = settings.map(item => ({
        dishTypeId: item.dishTypeId,
        restaurantId,
        price: item.price,
        isActive: item.isActive,
        isOnTheMenu: item.isOnTheMenu,
      }));

      await tx
        .insert(restaurantDishType)
        .values(dataToUpsert)
        .onConflictDoUpdate({
          target: [
            restaurantDishType.restaurantId,
            restaurantDishType.dishTypeId,
          ],
          set: {
            price: sql`excluded.price`,
            isActive: sql`excluded.is_active`,
            isOnTheMenu: sql`excluded.is_on_the_menu`,
          },
        });
    });
  }
}
