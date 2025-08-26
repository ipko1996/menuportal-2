import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '@/decorators/user.decorator';
import { RoleAuthGuard, Roles } from '@/guards/role.guard';
import type { AppUser } from '@/shared/types';

import { AuthService } from './auth.service';
import { UserDto, UserDtoWithRestaurant } from './dto/user.dto';

@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(RoleAuthGuard)
  @Roles('CUSTOMER')
  @ApiOperation({
    summary: 'Get the current user',
    operationId: 'getCurrentUser',
  })
  @ApiOkResponse({ type: UserDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden: User is banned' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Get()
  getUser(@CurrentUser() user: AppUser) {
    return this.authService.getUser(user);
  }

  @UseGuards(RoleAuthGuard)
  @Roles('MANAGER', 'ADMIN')
  @ApiOperation({
    summary: 'Get the current user with restaurant',
    operationId: 'getCurrentUserWithRestaurant',
  })
  @ApiOkResponse({ type: UserDtoWithRestaurant })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden: User is banned' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Get('with-restaurant')
  getUserWithRestaurant(
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ): Promise<UserDtoWithRestaurant> {
    return this.authService.getUserWithRestaurant(user);
  }

  @ApiOperation({
    summary: 'Callback for Facebook OAuth flow',
    operationId: 'facebookCallback',
  })
  @ApiOkResponse({ description: 'Successfully connected Facebook account' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized: Invalid token in state',
  })
  @Get('social/callback')
  async facebookCallback(
    @Query('code') code: string,
    @Query('state') state: string
  ) {
    return this.authService.handleFacebookCallback(code, state);
  }
}
