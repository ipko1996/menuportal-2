import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '@/decorators/user.decorator';
import { RoleAuthGuard, Roles } from '@/guards/role.guard';
import { AppUser } from '@/shared/types';

import { RestaurantSettingResponseDto } from './dto/restaurant-settings.response.dto';
import { UpdateRestaurantSettingDto } from './dto/update-restaurant.dto';
import { RestaurantSettingsService } from './restaurant.service';

@ApiTags('Restaurant Settings')
@UseGuards(RoleAuthGuard)
@Roles('ADMIN', 'MANAGER')
@ApiBearerAuth()
@Controller('restaurant/settings')
export class RestaurantSettingsController {
  constructor(
    private readonly restaurantSettingsService: RestaurantSettingsService
  ) {}

  @Get()
  @ApiOperation({
    summary: "Retrieve the restaurant's details",
    description:
      'Fetches the core details associated with the current restaurant.',
    operationId: 'findRestaurantSettings',
  })
  @ApiOkResponse({
    description: 'The restaurant details.',
    type: RestaurantSettingResponseDto,
  })
  findOne(@CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>) {
    return this.restaurantSettingsService.findOne(user.restaurant.id);
  }

  @Patch()
  @ApiOperation({
    summary: 'Update restaurant details',
    operationId: 'updateRestaurantSettings',
  })
  @ApiOkResponse({
    description: 'The restaurant details have been successfully updated.',
    type: RestaurantSettingResponseDto,
  })
  update(
    @Body() updateRestaurantSettingDto: UpdateRestaurantSettingDto,
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ) {
    return this.restaurantSettingsService.update(
      updateRestaurantSettingDto,
      user.restaurant.id
    );
  }
}
