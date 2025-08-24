import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { DateRange, WeekToDateRangePipe } from '@/shared/pipes';

import { TemplatesService } from './templates.service';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get(':restaurantId/:weekNumber')
  @ApiParam({
    name: 'restaurantId',
    description: 'ID of the restaurant',
    type: Number,
    example: 1,
  })
  @ApiParam({
    name: 'weekNumber',
    description: 'The week in ISO format (YYYY-Www), e.g., 2025-W32',
    example: '2025-W32',
    required: true,
  })
  @ApiOperation({
    summary: 'Get the menu for a specific restaurant and week',
    operationId: 'getRestaurantMenuForWeek',
  })
  async renderMenuForWeek(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('weekNumber', WeekToDateRangePipe) dateRange: DateRange,
    @Res() res: FastifyReply
  ) {
    const html = await this.templatesService.renderMenuForWeek(
      restaurantId,
      dateRange
    );
    res.type('text/html').send(html);
  }
}
