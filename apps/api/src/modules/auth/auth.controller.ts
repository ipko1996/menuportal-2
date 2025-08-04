import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AppUser } from '@/common/types/user.types';
import { CurrentUser } from '@/decorators/user.decorator';
import { RoleAuthGuard, Roles } from '@/guards/role.guard';

import { AuthService } from './auth.service';
import { UserDto } from './dto/user.dto';

@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(RoleAuthGuard)
  @Roles('ADMIN', 'MANAGER')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get the current user',
    operationId: 'getCurrentRestaurantOwner',
  })
  @ApiOkResponse({ type: UserDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden: User is banned' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Get()
  getUser(@CurrentUser() user: AppUser) {
    return this.authService.getUser(user);
  }
}
