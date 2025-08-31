import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import {
  DateRange,
  DateToDateRangePipe,
  WeekToDateRangePipe,
} from '@/shared/pipes';
import { MenuQueryDto } from '@/shared/types';

import { TemplatesService } from './templates.service';

@ApiTags('Templates')
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get('weekly/:restaurantId/:weekNumber')
  @ApiOperation({
    summary: 'Render a weekly HTML template',
    description:
      'Renders the HTML for a weekly menu. Use the optional "platform" query parameter to get a platform-specific version.',
    operationId: 'renderWeeklyTemplate',
  })
  @ApiParam({ name: 'restaurantId', example: 1 })
  @ApiParam({ name: 'weekNumber', example: '2025-W32' })
  @ApiProduces('text/html')
  @ApiResponse({
    status: 200,
    description: 'The rendered HTML content of the menu.',
    content: {
      'text/html': {
        schema: {
          type: 'string',
          example: '<!DOCTYPE html><html><body>...</body></html>',
        },
      },
    },
  })
  async renderWeeklyTemplate(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('weekNumber', WeekToDateRangePipe) dateRange: DateRange,
    @Query() query: MenuQueryDto,
    @Res() res: FastifyReply
  ) {
    const html = await this.templatesService.renderWeeklyMenuHtml(
      restaurantId,
      dateRange,
      query.platform
    );

    res.type('text/html').send(html);
  }

  @Get('daily/:restaurantId/:date')
  @ApiOperation({
    summary: 'Render a daily HTML template',
    description:
      'Renders the HTML for a daily menu. Use the optional "platform" query parameter to get a platform-specific version.',
    operationId: 'renderDailyTemplate',
  })
  @ApiParam({ name: 'restaurantId', example: 1 })
  @ApiParam({ name: 'date', example: '2025-08-31' })
  @ApiProduces('text/html')
  @ApiResponse({
    status: 200,
    description: 'The rendered HTML content of the menu.',
    content: {
      'text/html': {
        schema: {
          type: 'string',
          example: '<!DOCTYPE html><html><body>...</body></html>',
        },
      },
    },
  })
  async renderDailyTemplate(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('date', DateToDateRangePipe) dateRange: DateRange,
    @Query() query: MenuQueryDto,
    @Res() res: FastifyReply
  ) {
    const html = await this.templatesService.renderDailyMenuHtml(
      restaurantId,
      dateRange,
      query.platform
    );

    res.type('text/html').send(html);
  }
}
