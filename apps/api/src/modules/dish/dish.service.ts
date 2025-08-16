import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, ilike, not } from 'drizzle-orm';

import { dish, dishType } from '@/schema';
import { DatabaseService } from '@/shared/database/database.service';

import { CreateDishDto } from './dto/create-dish.dto';
import { DishResponseDto } from './dto/dish-response.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

@Injectable()
export class DishService {
  private readonly logger = new Logger(DishService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    createDishDto: CreateDishDto,
    restaurantId: number
  ): Promise<DishResponseDto> {
    const { dishName, dishTypeId } = createDishDto;

    // Validate dishTypeId that its existence in the database
    const dishTypeExists = await this.databaseService.db
      .select()
      .from(dishType)
      .where(and(eq(dishType.id, dishTypeId), eq(dishType.enabled, true)))
      .limit(1);

    if (dishTypeExists.length === 0) {
      throw new NotFoundException(
        `Dish type with ID ${dishTypeId} does not exist or not active`
      );
    }

    // Check if dish with the same name already exists for the restaurant
    const existingDish = await this.databaseService.db
      .select()
      .from(dish)
      .where(
        and(ilike(dish.dishName, dishName), eq(dish.restaurantId, restaurantId))
      )
      .limit(1);

    if (existingDish.length > 0) {
      throw new BadRequestException(
        `Dish with name "${dishName}" already exists for this restaurant`
      );
    }

    try {
      const [newDish]: DishResponseDto[] = await this.databaseService.db
        .insert(dish)
        .values({
          dishName,
          dishTypeId,
          restaurantId,
        })
        .returning({
          id: dish.id,
          dishName: dish.dishName,
          restaurantId: dish.restaurantId,
          dishTypeId: dish.dishTypeId,
        });

      return newDish;
    } catch (error) {
      this.logger.error('Failed to create new dish', error);
      throw new InternalServerErrorException('Failed to create new dish');
    }
  }

  async findAll(restaurantId?: number): Promise<DishResponseDto[]> {
    const whereCondition = restaurantId
      ? eq(dish.restaurantId, restaurantId)
      : undefined;

    return await this.databaseService.db
      .select({
        id: dish.id,
        dishName: dish.dishName,
        restaurantId: dish.restaurantId,
        dishTypeId: dish.dishTypeId,
      })
      .from(dish)
      .where(whereCondition);
  }

  /**
   * Finds a dish by its ID, optionally filtering by restaurant ID.
   * @param id - The ID of the dish to find.
   * @param restaurantId - Optional restaurant ID to filter the dish.
   * @returns {Promise<DishResponseDto>} - The found dish.
   *
   * @throws NotFoundException if the dish does not exist or is not active.
   */
  async findDishById(
    id: number,
    restaurantId: number
  ): Promise<DishResponseDto> {
    const whereConditions = restaurantId
      ? and(eq(dish.id, id), eq(dish.restaurantId, restaurantId))
      : eq(dish.id, id);

    const [foundDish] = await this.databaseService.db
      .select({
        id: dish.id,
        dishName: dish.dishName,
        restaurantId: dish.restaurantId,
        dishTypeId: dish.dishTypeId,
      })
      .from(dish)
      .where(whereConditions)
      .limit(1);

    if (!foundDish) {
      throw new NotFoundException(`Dish with ID ${id} not found`);
    }

    return foundDish;
  }

  async findDishByName(
    name: string,
    restaurantId: number
  ): Promise<DishResponseDto[]> {
    try {
      const searchPattern = `%${name.toLowerCase()}%`;

      // TODO: pagination

      return await this.databaseService.db
        .select({
          id: dish.id,
          dishName: dish.dishName,
          restaurantId: dish.restaurantId,
          dishTypeId: dish.dishTypeId,
        })
        .from(dish)
        .where(
          and(
            ilike(dish.dishName, searchPattern),
            eq(dish.restaurantId, restaurantId)
          )
        )
        .limit(10); // Returns empty array if no dishes found
    } catch (error) {
      this.logger.error(`Failed to fetch dishes matching name ${name}`, error);
      throw new BadRequestException('Failed to fetch dishes');
    }
  }

  async update(
    id: number,
    updateDishDto: UpdateDishDto,
    restaurantId: number
  ): Promise<DishResponseDto> {
    // First check if dish exists
    await this.findDishById(id, restaurantId);

    const { dishName, dishTypeId } = updateDishDto;

    // If dishTypeId is being updated, validate it exists
    if (dishTypeId !== undefined) {
      const dishTypeExists = await this.databaseService.db
        .select()
        .from(dishType)
        .where(and(eq(dishType.id, dishTypeId), eq(dishType.enabled, true)))
        .limit(1);

      if (dishTypeExists.length === 0) {
        throw new NotFoundException(
          `Dish type with ID ${dishTypeId} does not exist or not active`
        );
      }
    }

    // If dishName is being updated, check for duplicates
    if (dishName !== undefined && restaurantId !== undefined) {
      const existingDish = await this.databaseService.db
        .select()
        .from(dish)
        .where(
          and(
            ilike(dish.dishName, dishName),
            eq(dish.restaurantId, restaurantId),
            not(eq(dish.id, id))
          )
        )
        .limit(1);

      // Filter out the current dish manually since we can't easily do NOT in this query
      const duplicateDish = existingDish.find(d => d.id !== id);
      if (duplicateDish) {
        throw new BadRequestException(
          `Dish with name "${dishName}" already exists for this restaurant`
        );
      }
    }

    try {
      const whereConditions = restaurantId
        ? and(eq(dish.id, id), eq(dish.restaurantId, restaurantId))
        : eq(dish.id, id);

      const [updatedDish]: DishResponseDto[] = await this.databaseService.db
        .update(dish)
        .set({
          ...(dishName !== undefined && { dishName }),
          ...(dishTypeId !== undefined && { dishTypeId }),
        })
        .where(whereConditions)
        .returning({
          id: dish.id,
          dishName: dish.dishName,
          restaurantId: dish.restaurantId,
          dishTypeId: dish.dishTypeId,
        });

      if (!updatedDish) {
        throw new NotFoundException(`Dish with ID ${id} not found`);
      }

      return updatedDish;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Failed to update dish with ID ${id}`, error);
      throw new BadRequestException('Failed to update dish');
    }
  }

  async remove(id: number, restaurantId: number): Promise<void> {
    // First check if dish exists
    await this.findDishById(id, restaurantId);

    try {
      const whereConditions = restaurantId
        ? and(eq(dish.id, id), eq(dish.restaurantId, restaurantId))
        : eq(dish.id, id);

      const result = await this.databaseService.db
        .delete(dish)
        .where(whereConditions)
        .returning({ id: dish.id });

      if (result.length === 0) {
        throw new NotFoundException(`Dish with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete dish with ID ${id}`, error);
      throw new BadRequestException('Failed to delete dish');
    }
  }
}
