import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { CurrentUser } from '@/decorators/user.decorator';
import { RoleAuthGuard, Roles } from '@/guards/role.guard';
import { AppUser } from '@/shared/types';

import { SocialDto } from './dto/social.dto';
import { SocialService } from './social.service';

@UseGuards(RoleAuthGuard)
@Roles('ADMIN', 'MANAGER')
@ApiBearerAuth()
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all social media accounts for the restaurant',
    operationId: 'getAllSocialAccountsForRestaurant',
  })
  @ApiOkResponse({ type: [SocialDto] })
  findAllSocaialsForRestaurant(
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ): Promise<SocialDto[]> {
    return this.socialService.findAllSocaialsForRestaurant(user.restaurant.id);
  }
}
