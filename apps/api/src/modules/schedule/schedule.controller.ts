import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { CurrentUser } from '@/decorators/user.decorator';
import { RoleAuthGuard, Roles } from '@/guards/role.guard';
import { DateRange, WeekToDateRangePipe } from '@/shared/pipes';
import { AppUser } from '@/shared/types';

import { WeekMenuDayDto } from '../week-menu/dto/week-menu-response.dto';
import {
  GetScheduleSettingsResponseDto,
  UpdateScheduleSettingsDto,
} from './dto/schedule-settings.dto';
import { ScheduleService } from './schedule.service';

@ApiExtraModels(WeekMenuDayDto, GetScheduleSettingsResponseDto)
@UseGuards(RoleAuthGuard)
@Roles('ADMIN', 'MANAGER')
@ApiBearerAuth()
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('settings')
  @ApiOperation({
    summary: 'Get schedule settings for the restaurant',
    operationId: 'getScheduleSettings',
  })
  @ApiOkResponse({
    description: 'Schedule settings retrieved successfully.',
    type: GetScheduleSettingsResponseDto,
  })
  @ApiNotFoundResponse({ description: 'No active settings found.' })
  getScheduleSettings(@CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>) {
    return this.scheduleService.getScheduleSettings(user.restaurant.id);
  }

  @Put('settings')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({
    summary: 'Update schedule settings for the restaurant',
    operationId: 'updateScheduleSettings',
  })
  @ApiBody({ type: UpdateScheduleSettingsDto })
  @ApiOkResponse({ description: 'Schedule settings updated successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid data provided.' })
  updateScheduleSettings(
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>,
    @Body() updateScheduleSettingsDto: UpdateScheduleSettingsDto
  ) {
    return this.scheduleService.updateScheduleSettings(
      user.restaurant.id,
      updateScheduleSettingsDto
    );
  }

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
  @ApiOkResponse({ description: 'Week successfully scheduled' })
  @ApiBadRequestResponse({
    description: 'Week already scheduled or invalid data',
  })
  @ApiBadRequestResponse({
    description: 'No menus or offers found to schedule for the week',
  })
  scheduleWeek(
    @Param('weekNumber', WeekToDateRangePipe) dateRange: DateRange,
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ) {
    return this.scheduleService.scheduleWeek(dateRange, user.restaurant.id);
  }

  @Delete(':weekNumber')
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
  @ApiOkResponse({ description: 'Scheduled week successfully cancelled' })
  @ApiBadRequestResponse({ description: 'No scheduled week found' })
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
