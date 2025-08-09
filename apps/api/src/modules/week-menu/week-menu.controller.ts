import { Controller, Get, Param, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

import { DateRange, WeekToDateRangePipe } from '@/shared/pipes';

import { WeekMenuResponseDto } from './dto/week-menu-response.dto';
import { WeekMenuService } from './week-menu.service';

@Controller('week-menu')
export class WeekMenuController {
  constructor(private readonly weekMenuService: WeekMenuService) {}

  @Get(':weekNumber')
  @ApiOperation({ summary: 'Get all menus for a specific week' })
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
    @Param('weekNumber', WeekToDateRangePipe) dateRange: DateRange
  ): Promise<WeekMenuResponseDto> {
    console.log('Received date range:', dateRange);
    return this.weekMenuService.getMenusForWeek(dateRange);
  }
}
