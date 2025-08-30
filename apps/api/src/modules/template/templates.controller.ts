import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { SocialMediaPlatform, socialMediaPlatformValues } from '@/schema';
import { DateRange, WeekToDateRangePipe } from '@/shared/pipes';

import { TemplatesService } from './templates.service';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get(':restaurantId/:weekNumber/:platform')
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
  @ApiParam({
    name: 'platform',
    description: 'The social media platform to generate the template for',
    enum: socialMediaPlatformValues,
    example: 'FACEBOOK',
    required: true,
  })
  @ApiOperation({
    summary: 'Get the menu for a specific restaurant, week, and platform',
    operationId: 'getRestaurantMenuForWeekAndPlatform',
  })
  async renderMenuForWeek(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('weekNumber', WeekToDateRangePipe) dateRange: DateRange,
    @Param('platform', new ParseEnumPipe(socialMediaPlatformValues))
    platform: SocialMediaPlatform,
    @Res() res: FastifyReply
  ) {
    const html = await this.templatesService.renderMenuForWeek(
      restaurantId,
      dateRange,
      platform,
      'WEEKLY'
    );
    res.type('text/html').send(html);
  }
}
