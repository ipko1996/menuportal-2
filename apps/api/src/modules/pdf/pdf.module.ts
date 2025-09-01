import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { TemplatesModule } from '../template/templates.module';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';

@Module({
  controllers: [PdfController],
  providers: [PdfService],
  exports: [PdfService],
  imports: [HttpModule, TemplatesModule],
})
export class PdfModule {}
