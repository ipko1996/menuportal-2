import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
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

import { ScheduleType, ScheduleTypeEnum } from '@/constants';
import { CurrentUser } from '@/decorators/user.decorator';
import { RoleAuthGuard, Roles } from '@/guards/role.guard';
import { DateRange, WeekToDateRangePipe } from '@/shared/pipes';
import { AppUser } from '@/shared/types';

import {
  GetScheduleSettingsResponseDto,
  PlatformSettingsDto,
  ScheduleSettingsDto,
  UpdateScheduleSettingsDto,
} from './dto/schedule-settings.dto';
import { ScheduleService } from './schedule.service';

@ApiExtraModels(PlatformSettingsDto, GetScheduleSettingsResponseDto)
@UseGuards(RoleAuthGuard)
@Roles('ADMIN', 'MANAGER')
@ApiBearerAuth()
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('settings/:scheduleType')
  @ApiOperation({
    summary: 'Gets schedule settings for a restaurant',
    operationId: 'getScheduleSettings',
  })
  @ApiParam({ name: 'scheduleType', enum: ScheduleTypeEnum.enumValues })
  @ApiOkResponse({ type: GetScheduleSettingsResponseDto })
  @ApiNotFoundResponse({ description: 'Settings not found.' })
  getScheduleSettings(
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>,
    @Param('scheduleType') scheduleType: ScheduleType
  ) {
    return this.scheduleService.getScheduleSettings(
      user.restaurant.id,
      scheduleType
    );
  }

  @Post('settings')
  @ApiOperation({
    summary: 'Creates schedule settings for a restaurant',
    operationId: 'createScheduleSettings',
  })
  @ApiBody({ type: ScheduleSettingsDto })
  @ApiOkResponse({ description: 'Settings created successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid data provided.' })
  createScheduleSettings(
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>,
    @Body() createScheduleSettingsDto: ScheduleSettingsDto
  ) {
    return this.scheduleService.createScheduleSettings(
      user.restaurant.id,
      createScheduleSettingsDto
    );
  }

  @Put('settings')
  @ApiOperation({
    summary: 'Updates schedule settings for a restaurant',
    operationId: 'updateScheduleSettings',
  })
  @ApiBody({ type: UpdateScheduleSettingsDto })
  @ApiOkResponse({ description: 'Settings updated successfully.' })
  @ApiNotFoundResponse({ description: 'Settings not found to update.' })
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

  @Delete('settings/:scheduleType')
  @ApiOperation({
    summary: 'Deactivates schedule settings for a restaurant',
    operationId: 'deactivateScheduleSettings',
  })
  @ApiParam({ name: 'scheduleType', enum: ScheduleTypeEnum.enumValues })
  @ApiOkResponse({ description: 'Schedule deactivated successfully.' })
  @ApiNotFoundResponse({ description: 'Settings not found to deactivate.' })
  deactivateScheduleSettings(
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>,
    @Param('scheduleType') scheduleType: ScheduleType
  ) {
    return this.scheduleService.deactivateScheduleSettings(
      user.restaurant.id,
      scheduleType
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
