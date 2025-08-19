import { Module } from '@nestjs/common';

import { WeekScheduleModule } from '../week-schedule/week-schedule.module';
import { WeekMenuController } from './week-menu.controller';
import { WeekMenuService } from './week-menu.service';

@Module({
  controllers: [WeekMenuController],
  providers: [WeekMenuService],
  exports: [WeekMenuService],
  imports: [WeekScheduleModule],
})
export class WeekMenuModule {}
