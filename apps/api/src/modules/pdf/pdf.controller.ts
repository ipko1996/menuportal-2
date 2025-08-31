import {
  Controller,
  Get,
  Logger,
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
import { GenerateMenuQueryDto } from '@/shared/types';

import { PdfService } from './pdf.service';

const APPLICATION_PDF = 'application/pdf';
const IMAGE_PNG = 'image/png';

@ApiTags('PDF & Image Generation')
@Controller('pdf')
export class PdfController {
  private readonly logger = new Logger(PdfController.name);

  constructor(private readonly pdfService: PdfService) {}

  @Get('weekly/:restaurantId/:weekNumber')
  @ApiOperation({
    summary: 'Download a weekly menu as a PDF or PNG image',
    description:
      'Generates a weekly menu. Use the query parameters to select the format (PDF/PNG) and to specify a platform-specific template.',
    operationId: 'getWeeklyMenu',
  })
  @ApiParam({ name: 'restaurantId', example: 1 })
  @ApiParam({ name: 'weekNumber', example: '2025-W32' })
  @ApiProduces(APPLICATION_PDF, IMAGE_PNG)
  @ApiResponse({
    status: 200,
    description: 'The generated file (PDF or PNG)',
    content: {
      'application/pdf': {
        schema: { type: 'string', format: 'binary' },
      },
      'image/png': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  async getWeeklyMenu(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('weekNumber', WeekToDateRangePipe) dateRange: DateRange,
    @Query() query: GenerateMenuQueryDto,
    @Res() res: FastifyReply
  ) {
    const { buffer, fileName, contentType } =
      await this.pdfService.generateWeeklyMenuFile(
        restaurantId,
        dateRange,
        query
      );

    await this._sendFile(res, buffer, contentType, fileName);
  }

  @Get('daily/:restaurantId/:date')
  @ApiOperation({
    summary: 'Download a daily menu as a PDF or PNG image',
    description:
      'Generates a daily menu. Use the query parameters to select the format (PDF/PNG) and to specify a platform-specific template.',
    operationId: 'getDailyMenu',
  })
  @ApiParam({ name: 'restaurantId', example: 1 })
  @ApiParam({ name: 'date', example: '2025-08-31' })
  @ApiProduces(APPLICATION_PDF, IMAGE_PNG)
  async getDailyMenu(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('date', DateToDateRangePipe) dateRange: DateRange,
    @Query() query: GenerateMenuQueryDto,
    @Res() res: FastifyReply
  ) {
    const { buffer, fileName, contentType } =
      await this.pdfService.generateDailyMenuFile(
        restaurantId,
        dateRange,
        query
      );

    await this._sendFile(res, buffer, contentType, fileName);
  }

  private async _sendFile(
    res: FastifyReply,
    buffer: Buffer,
    contentType: string,
    fileName: string
  ): Promise<void> {
    try {
      res.header('Content-Type', contentType);
      res.header('Content-Disposition', `attachment; filename="${fileName}"`);
      res.header('Content-Length', buffer.length.toString());
      res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.send(buffer);
    } catch (error) {
      this.logger.error(`Error sending file: ${fileName}`, error.stack);
      throw error;
    }
  }
}
