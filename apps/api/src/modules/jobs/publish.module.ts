import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { SharedModule } from '@/shared/shared.module';

import { PdfModule } from '../pdf/pdf.module';
import { PostModule } from '../post/post.module';
import { PublishController } from './publish.controller';
import { PublishService } from './publish.service';

@Module({
  imports: [PostModule, PdfModule, SharedModule, HttpModule],
  controllers: [PublishController],
  providers: [PublishService],
})
export class PublishModule {}
