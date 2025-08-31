import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '@/decorators/user.decorator';
import { RoleAuthGuard, Roles } from '@/guards/role.guard';
import type { DateRange } from '@/shared/pipes';
import { WeekToDateRangePipe } from '@/shared/pipes';
import type { AppUser } from '@/shared/types';

import {
  WeekMenuDayDto,
  WeekMenuResponseDto,
} from './dto/week-menu-response.dto';
import { WeekMenuService } from './week-menu.service';

@ApiExtraModels(WeekMenuDayDto)
@Controller('week-menu')
@UseGuards(RoleAuthGuard)
@Roles('ADMIN', 'MANAGER')
@ApiBearerAuth()
export class WeekMenuController {
  constructor(private readonly weekMenuService: WeekMenuService) {}

  @Get(':weekNumber')
  @ApiOperation({
    summary: 'Get all menus for a specific week',
    operationId: 'getMenusForWeek',
  })
  @ApiParam({
    name: 'weekNumber',
    description: 'The week in ISO format (YYYY-Www), e.g., 2025-W32',
    example: '2025-W32',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'The menu for the specified week.',
    type: WeekMenuResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Invalid weekNumber format or non-existent week.',
  })
  async getMenusForWeek(
    @Param('weekNumber', WeekToDateRangePipe) dateRange: DateRange,
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ): Promise<WeekMenuResponseDto> {
    console.log('Received date range:', dateRange);
    return this.weekMenuService.getMenusForWeek(dateRange, user.restaurant.id);
  }
}
