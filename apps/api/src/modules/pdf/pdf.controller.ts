import {
  Controller,
  Get,
  Logger,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
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

import { SocialMediaPlatform, socialMediaPlatformValues } from '@/constants';
import { DateRange, WeekToDateRangePipe } from '@/shared/pipes';

import { TemplatesService } from '../template/templates.service';
import { PdfService } from './pdf.service';

const CONTENT_TYPE_PDF = 'application/pdf';

@ApiTags('PDF')
@Controller('pdf')
export class PdfController {
  private readonly logger = new Logger(PdfController.name);

  constructor(
    private readonly pdfService: PdfService,
    private readonly templatesService: TemplatesService
  ) {}

  @Get('download/:restaurantId/:weekNumber/:platform')
  @ApiOperation({
    summary: 'Download the menu for a specific week as a PDF',
    operationId: 'downloadRestaurantMenuForWeek',
  })
  @ApiParam({ name: 'restaurantId', type: Number, example: 1 })
  @ApiParam({ name: 'weekNumber', type: String, example: '2025-W32' })
  @ApiParam({
    name: 'platform',
    description: 'The social media platform to generate the template for',
    enum: socialMediaPlatformValues,
    example: 'FACEBOOK',
    required: true,
  })
  @ApiProduces(CONTENT_TYPE_PDF)
  @ApiResponse({
    status: 200,
    description: 'PDF file download',
    schema: {
      type: 'string',
      format: 'binary',
    },
    headers: {
      'Content-Type': {
        description: 'MIME type of the file',
        schema: {
          type: 'string',
          example: CONTENT_TYPE_PDF,
        },
      },
      'Content-Disposition': {
        description: 'Indicates the file should be downloaded',
        schema: {
          type: 'string',
          example: 'attachment; filename="menu-1-2025 32.pdf"',
        },
      },
      'Content-Length': {
        description: 'Size of the file in bytes',
        schema: {
          type: 'number',
          example: 123_456,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description:
      'Restaurant not found or no menu available for the specified week',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid restaurant ID or week number format',
  })
  async downloadMenuForWeek(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('weekNumber', WeekToDateRangePipe) dateRange: DateRange,
    @Param('platform', new ParseEnumPipe(socialMediaPlatformValues))
    platform: SocialMediaPlatform,
    @Res() res: FastifyReply
  ) {
    try {
      const html = await this.templatesService.renderMenuForWeek(
        restaurantId,
        dateRange,
        platform,
        'WEEKLY'
      );

      const pdfBuffer = await this.pdfService.generatePdfFromHtml(html);

      const fileName = `menu-${restaurantId}-${dateRange.year} ${dateRange.weekNumber}.pdf`;
      res.header('Content-Type', CONTENT_TYPE_PDF);
      res.header('Content-Disposition', `attachment; filename="${fileName}"`);
      res.header('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      this.logger.error(
        `Error generating PDF for restaurant ${restaurantId} week ${dateRange.weekNumber}:`,
        error instanceof Error ? error.message : error
      );
      throw error;
    }
  }

  @Get('download/image/:restaurantId/:weekNumber/:platform')
  @ApiOperation({
    summary: 'Download the menu for a specific week as a PNG image',
    operationId: 'downloadRestaurantMenuForWeekAsImage',
  })
  @ApiParam({ name: 'restaurantId', type: Number, example: 1 })
  @ApiParam({ name: 'weekNumber', type: String, example: '2025-W32' })
  @ApiParam({
    name: 'platform',
    description: 'The social media platform to generate the template for',
    enum: socialMediaPlatformValues,
    example: 'FACEBOOK',
    required: true,
  })
  @ApiProduces('image/png')
  @ApiResponse({
    status: 200,
    description: 'PNG image file download',
    schema: {
      type: 'string',
      format: 'binary',
    },
    headers: {
      'Content-Type': {
        description: 'MIME type of the file',
        schema: {
          type: 'string',
          example: 'image/png',
        },
      },
      'Content-Disposition': {
        description: 'Indicates the file should be downloaded',
        schema: {
          type: 'string',
          example: 'attachment; filename="menu-1-2025-W32.png"',
        },
      },
      'Content-Length': {
        description: 'Size of the file in bytes',
        schema: {
          type: 'number',
          example: 123_456,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description:
      'Restaurant not found or no menu available for the specified week',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid restaurant ID or week number format',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during image generation',
  })
  async downloadMenuForWeekAsImage(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('weekNumber', WeekToDateRangePipe) dateRange: DateRange,
    @Param('platform', new ParseEnumPipe(socialMediaPlatformValues))
    platform: SocialMediaPlatform,
    @Res() res: FastifyReply
  ) {
    try {
      // 1. Generate the HTML using your existing service
      const html = await this.templatesService.renderMenuForWeek(
        restaurantId,
        dateRange,
        platform,
        'WEEKLY'
      );

      // 2. Convert the HTML to an image using the service
      const imageBuffer = await this.pdfService.generateImageFromHtml(html);

      // 3. Set response headers to trigger a download
      const fileName = `menu-${restaurantId}-${dateRange.year}-W${dateRange.weekNumber}.png`;

      res.header('Content-Type', 'image/png');
      res.header('Content-Disposition', `attachment; filename="${fileName}"`);
      res.header('Content-Length', imageBuffer.length.toString());
      res.header('Cache-Control', 'no-cache, no-store, must-revalidate');

      // 4. Send the image buffer as the response
      return res.send(imageBuffer);
    } catch (error) {
      // Log the error for debugging
      this.logger.error(
        `Error generating image for restaurant ${restaurantId} week ${dateRange.weekNumber}:`,
        error instanceof Error ? error.message : error
      );

      // Re-throw to let NestJS handle the error response
      throw error;
    }
  }
}
