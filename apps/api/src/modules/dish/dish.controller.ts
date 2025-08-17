import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '@/decorators/user.decorator';
import { RoleAuthGuard, Roles } from '@/guards/role.guard';
import type { AppUser } from '@/shared/types';

import { DishService } from './dish.service';
import { CreateDishDto } from './dto/create-dish.dto';
import {
  DishFilterDto,
  DishPaginatedResponseDto,
  DishResponseDto,
} from './dto/dish-response.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

@ApiTags('dish')
@UseGuards(RoleAuthGuard)
@Roles('ADMIN', 'MANAGER')
@ApiBearerAuth()
@Controller('dish')
export class DishController {
  constructor(private readonly dishService: DishService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new dish', operationId: 'createDish' })
  @ApiResponse({
    status: 201,
    description: 'Dish created successfully',
    type: DishResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Dish name already exists or invalid data',
  })
  @ApiResponse({
    status: 404,
    description: 'Dish type not found or inactive',
  })
  create(
    @Body() createDishDto: CreateDishDto,
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ): Promise<DishResponseDto> {
    return this.dishService.create(createDishDto, user.restaurant.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get paginated dishes with search',
    operationId: 'getPaginatedDishes',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of dishes retrieved successfully',
    type: DishPaginatedResponseDto,
  })
  findPaginated(
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>,
    @Query() searchOptions: DishFilterDto
  ): Promise<DishPaginatedResponseDto> {
    return this.dishService.findPaginated(searchOptions, user.restaurant.id);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search for dishes by name (fuzzy search)',
    operationId: 'searchDishesByName',
  })
  @ApiQuery({
    name: 'name',
    required: true,
    type: String,
    description: 'Name or partial name of the dish to search for',
  })
  @ApiResponse({
    status: 200,
    description: 'Dishes found successfully',
    type: [DishResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'No dishes found matching the search term',
  })
  findByName(
    @Query('name') name: string,
    @CurrentUser()
    user: AppUser<'MANAGER' | 'ADMIN'>
  ): Promise<DishResponseDto[]> {
    const restaurantId = user.restaurant.id;

    return this.dishService.findDishByName(name, restaurantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a dish by ID', operationId: 'getDishById' })
  @ApiResponse({
    status: 200,
    description: 'Dish retrieved successfully',
    type: DishResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Dish not found',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ): Promise<DishResponseDto> {
    const restaurantId = user.restaurant.id;
    return this.dishService.findDishById(id, restaurantId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a dish by ID',
    operationId: 'updateDishById',
  })
  @ApiResponse({
    status: 200,
    description: 'Dish updated successfully',
    type: DishResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Dish name already exists or invalid data',
  })
  @ApiResponse({
    status: 404,
    description: 'Dish or dish type not found',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDishDto: UpdateDishDto,
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ): Promise<DishResponseDto> {
    const restaurantId = user.restaurant.id;
    return this.dishService.update(id, updateDishDto, restaurantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a dish by ID',
    operationId: 'deleteDishById',
  })
  @ApiResponse({
    status: 204,
    description: 'Dish deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Dish not found',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ): Promise<void> {
    const restaurantId = user.restaurant.id;
    return this.dishService.remove(id, restaurantId);
  }
}
