import { Module } from '@nestjs/common';

import { BusinessHoursModule } from '../business-hours/business-hours.module';
import { WeekMenuModule } from '../week-menu/week-menu.module';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';

@Module({
  controllers: [TemplatesController],
  providers: [TemplatesService],
  imports: [WeekMenuModule, BusinessHoursModule],
  exports: [TemplatesService],
})
export class TemplatesModule {}
