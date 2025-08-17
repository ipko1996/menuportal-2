import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { CurrentUser } from '@/decorators/user.decorator';
import { RoleAuthGuard, Roles } from '@/guards/role.guard';
import { DateRange, WeekToDateRangePipe } from '@/shared/pipes';
import { AppUser } from '@/shared/types';

import { WeekMenuDayDto } from '../week-menu/dto/week-menu-response.dto';
import { ScheduleService } from './schedule.service';

@ApiExtraModels(WeekMenuDayDto)
@UseGuards(RoleAuthGuard)
@Roles('ADMIN', 'MANAGER')
@ApiBearerAuth()
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post(':weekNumber')
  @ApiOperation({
    summary: 'Schedule a week for a restaurant',
    operationId: 'scheduleWeek',
  })
  @ApiParam({
    name: 'weekNumber',
    description: 'The week in ISO format (YYYY-Www), e.g., 2025-W32',
    example: '2025-W32',
    required: true,
  })
  scheduleWeek(
    @Param('weekNumber', WeekToDateRangePipe) dateRange: DateRange,
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ) {
    return this.scheduleService.scheduleWeek(dateRange, user.restaurant.id);
  }

  @ApiOperation({
    summary: 'Cancel a scheduled week for a restaurant',
    operationId: 'cancelScheduledWeek',
  })
  @ApiParam({
    name: 'weekNumber',
    description: 'The week in ISO format (YYYY-Www), e.g., 2025-W32',
    example: '2025-W32',
    required: true,
  })
  @Delete(':weekNumber')
  cancelScheduledWeek(
    @Param('weekNumber', WeekToDateRangePipe) dateRange: DateRange,
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ) {
    return this.scheduleService.cancelScheduledWeek(
      dateRange,
      user.restaurant.id
    );
  }
}
