import { Module } from '@nestjs/common';

import { WeekMenuModule } from '../week-menu/week-menu.module';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';

@Module({
  controllers: [TemplatesController],
  providers: [TemplatesService],
  imports: [WeekMenuModule],
})
export class TemplatesModule {}
