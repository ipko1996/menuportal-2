import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '@/decorators/user.decorator';
import { RoleAuthGuard, Roles } from '@/guards/role.guard';
import { AppUser } from '@/shared/types';

import { DishtypeService } from './dishtype.service';
import {
  BaseDishTypeResponseDto,
  DishTypeWithDataResponseDto,
} from './dto/dishtype-response.dto';
import { UpdateRestaurantDishTypesDto } from './dto/update-dish-type.dto';

@ApiTags('Restaurant Settings')
@UseGuards(RoleAuthGuard)
@Roles('ADMIN', 'MANAGER')
@ApiBearerAuth()
@Controller('restaurant/settings/dish-types')
export class DishtypeController {
  constructor(private readonly dishtypeService: DishtypeService) {}

  @Get()
  @ApiOperation({
    summary: "Get a restaurant's dish type settings",
    description:
      "Retrieves all system dish types, augmented with the restaurant's specific settings (price, status).",
    operationId: 'getRestaurantDishTypes',
  })
  @ApiOkResponse({
    description: 'List of dish type settings for the restaurant.',
    type: [DishTypeWithDataResponseDto],
  })
  findAll(@CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>) {
    return this.dishtypeService.findAll(user.restaurant.id);
  }

  @Get('master')
  @ApiOperation({
    summary: 'Get all globally enabled dish types',
    description:
      'Fetches the master list of all dish types available in the system for a restaurant to configure.',
    operationId: 'getSystemDishTypes',
  })
  @ApiOkResponse({
    description: 'A list of all enabled dish types.',
    type: [BaseDishTypeResponseDto],
  })
  findAllEnabled() {
    return this.dishtypeService.findAllEnabled();
  }

  @Put()
  @ApiOperation({
    summary: "Update a restaurant's dish type settings",
    description:
      'Bulk creates, updates, or deactivates dish type associations, including their prices and statuses.',
    operationId: 'updateRestaurantDishTypes',
  })
  @ApiOkResponse({
    description: 'Dish type settings were successfully updated.',
    type: [DishTypeWithDataResponseDto],
  })
  async update(
    @Body() updateDto: UpdateRestaurantDishTypesDto,
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ) {
    await this.dishtypeService.upsertDishTypesForRestaurant(
      updateDto,
      user.restaurant.id
    );

    return this.dishtypeService.findAll(user.restaurant.id);
  }
}
