import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { availability, dishMenu, menu } from '@/schema';
import { DatabaseService } from '@/shared/database/database.service';

import { DishService } from '../dish/dish.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { MenuResponseDto } from './dto/menu-response.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  private readonly logger = new Logger(MenuService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly dishService: DishService
  ) {}

  async create(
    createMenuDto: CreateMenuDto,
    restaurantId: number
  ): Promise<MenuResponseDto> {
    const {
      availability: menuAvailability,
      dishes,
      menuName,
      price,
    } = createMenuDto;

    // Validate that at least two different dishes are provided
    const uniqueDishes = new Set(dishes);
    if (uniqueDishes.size < 2) {
      throw new BadRequestException(
        'At least two different dishes are required'
      );
    }

    // Validate and get dishes
    const dishEntities = dishes.map(dishId =>
      this.dishService.findDishById(dishId, restaurantId)
    );
    const validatedDishes = await Promise.all(dishEntities);

    // Validate that dishtypes are different
    const dishTypes = new Set(validatedDishes.map(dish => dish.dishTypeId));
    if (dishTypes.size < 2) {
      throw new BadRequestException(
        'Dishes must have at least two different types'
      );
    }

    // TODO: Should we check if the same menu with same dishes and availability already exists?

    try {
      const [newMenu, newAvailability] =
        await this.databaseService.db.transaction(async tx => {
          const [newMenu] = await tx
            .insert(menu)
            .values({
              restaurantId,
              menuName,
              price,
            })
            .returning();

          await tx.insert(dishMenu).values(
            validatedDishes.map(dish => ({
              dishId: dish.id,
              menuId: newMenu.id,
              dishTypeId: dish.dishTypeId,
            }))
          );

          const [newAvailability] = await tx
            .insert(availability)
            .values({
              date: menuAvailability,
              entityId: newMenu.id,
              entityType: 'MENU',
            })
            .returning();
          return [newMenu, newAvailability];
        });

      return {
        id: newMenu.id,
        menuName: newMenu.menuName,
        price: newMenu.price,
        availability: newAvailability.date,
        dishes: validatedDishes.map(dish => dish.id),
      };
    } catch (error) {
      this.logger.error('Error creating menu', error);
      throw error;
    }
  }

  findAll() {
    return `This action returns all menu`;
  }

  findOne(id: number) {
    return `This action returns a #${id} menu`;
  }

  async update(
    id: number,
    updateMenuDto: UpdateMenuDto,
    restaurantId: number
  ): Promise<MenuResponseDto> {
    const {
      availability: menuAvailability,
      dishes,
      menuName,
      price,
    } = updateMenuDto;

    // First, verify the menu exists and belongs to the restaurant
    const existingMenu = await this.databaseService.db.query.menu.findFirst({
      where: and(eq(menu.id, id), eq(menu.restaurantId, restaurantId)),
      with: {
        dishMenus: true,
      },
    });

    if (!existingMenu) {
      throw new NotFoundException('Menu not found');
    }

    // Get existing availability for the menu
    const existingAvailability =
      await this.databaseService.db.query.availability.findFirst({
        where: and(
          eq(availability.entityId, id),
          eq(availability.entityType, 'MENU')
        ),
      });

    if (!existingAvailability) {
      throw new InternalServerErrorException('Menu availability not found');
    }

    // Validate dishes if they're being updated
    const validatedDishes = existingMenu.dishMenus;
    if (dishes && dishes.length > 0) {
      // Validate that at least two different dishes are provided
      const uniqueDishes = new Set(dishes);
      if (uniqueDishes.size < 2) {
        throw new BadRequestException(
          'At least two different dishes are required'
        );
      }

      // Validate and get dishes
      const dishEntities = dishes.map(dishId =>
        this.dishService.findDishById(dishId, restaurantId)
      );
      await Promise.all(dishEntities);

      // Validate that dish types are different
      const dishTypes = new Set(validatedDishes.map(dish => dish.dishTypeId));
      if (dishTypes.size < 2) {
        throw new BadRequestException(
          'Dishes must have at least two different types'
        );
      }
    }

    try {
      const [updatedMenu, updatedAvailability] =
        await this.databaseService.db.transaction(async tx => {
          const updateData: Partial<typeof menu.$inferInsert> = {};
          if (menuName !== undefined) updateData.menuName = menuName;
          if (price !== undefined) updateData.price = price;

          const [menuResult] = await tx
            .update(menu)
            .set(updateData)
            .where(eq(menu.id, id))
            .returning();

          // Update dishes if they were changed
          if (dishes && dishes.length > 0) {
            // Delete existing dish-menu relationships
            await tx.delete(dishMenu).where(eq(dishMenu.menuId, id));

            // Insert new relationships
            await tx.insert(dishMenu).values(
              validatedDishes.map(dish => ({
                dishId: dish.dishId,
                menuId: id,
                dishTypeId: dish.dishTypeId,
              }))
            );
          }

          let availabilityResult: typeof availability.$inferInsert | undefined;
          if (menuAvailability) {
            [availabilityResult] = await tx
              .update(availability)
              .set({ date: menuAvailability })
              .where(
                and(
                  eq(availability.entityId, id),
                  eq(availability.entityType, 'MENU')
                )
              )
              .returning();
          }

          return [menuResult, availabilityResult ?? existingAvailability];
        });

      // Get the updated list of dish IDs (either the new ones or the existing ones if not updated)
      const updatedDishIds =
        dishes && dishes.length > 0
          ? validatedDishes.map(dish => dish.dishId)
          : existingMenu.dishMenus.map(dish => dish.dishId);

      return {
        id: updatedMenu.id,
        menuName: updatedMenu.menuName,
        price: updatedMenu.price,
        availability: updatedAvailability?.date || existingAvailability.date,
        dishes: updatedDishIds,
      };
    } catch (error) {
      this.logger.error('Error updating menu', error);
      throw new InternalServerErrorException('Failed to update menu');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} menu`;
  }
}
