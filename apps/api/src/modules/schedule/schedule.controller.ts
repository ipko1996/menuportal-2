import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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

import { CreateScheduleDto } from './dto/create-schedule.dto';
import { GetScheduleSettingsResponseDto } from './dto/schedule-settings.dto';
import {
  UpdatePlatformScheduleDto,
  UpdateScheduleDto,
} from './dto/update-schedule.dto';
import { ScheduleService } from './schedule.service';

@UseGuards(RoleAuthGuard)
@Roles('ADMIN', 'MANAGER')
@ApiBearerAuth()
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('settings/:scheduleType')
  @ApiOperation({
    summary: 'Get schedule settings',
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
    summary: 'Create new schedule settings',
    operationId: 'createScheduleSettings',
  })
  @ApiBody({ type: CreateScheduleDto })
  @ApiOkResponse({ description: 'Settings created successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid data provided.' })
  createScheduleSettings(
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>,
    @Body() createScheduleDto: CreateScheduleDto
  ) {
    return this.scheduleService.createScheduleSettings(
      user.restaurant.id,
      createScheduleDto
    );
  }

  @Put('settings/:scheduleType')
  @ApiOperation({
    summary: 'Update core schedule settings',
    description:
      'Updates the main settings like post time, default text, and the global active status.',
    operationId: 'updateCoreScheduleSettings',
  })
  @ApiParam({ name: 'scheduleType', enum: ScheduleTypeEnum.enumValues })
  @ApiBody({ type: UpdateScheduleDto })
  @ApiOkResponse({ description: 'Settings updated successfully.' })
  @ApiNotFoundResponse({ description: 'Settings not found to update.' })
  updateCoreScheduleSettings(
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>,
    @Param('scheduleType') scheduleType: ScheduleType,
    @Body() updateScheduleDto: UpdateScheduleDto
  ) {
    return this.scheduleService.updateCoreScheduleSettings(
      user.restaurant.id,
      scheduleType,
      updateScheduleDto
    );
  }

  @Put('settings/platforms/:platformScheduleId')
  @ApiOperation({
    summary: "Update a single platform's settings",
    description:
      "Updates a specific platform's active status or custom content text.",
    operationId: 'updatePlatformScheduleSettings',
  })
  @ApiParam({ name: 'platformScheduleId', type: 'number' })
  @ApiBody({ type: UpdatePlatformScheduleDto })
  @ApiOkResponse({ description: 'Platform settings updated successfully.' })
  @ApiNotFoundResponse({ description: 'Platform settings not found.' })
  updatePlatformScheduleSettings(
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>,
    @Param('platformScheduleId', ParseIntPipe) platformScheduleId: number,
    @Body() updatePlatformDto: UpdatePlatformScheduleDto
  ) {
    return this.scheduleService.updatePlatformScheduleSettings(
      user.restaurant.id,
      platformScheduleId,
      updatePlatformDto
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
