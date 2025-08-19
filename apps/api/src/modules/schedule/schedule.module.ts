import { Module } from '@nestjs/common';

import { WeekMenuModule } from '../week-menu/week-menu.module';
import { WeekScheduleModule } from '../week-schedule/week-schedule.module';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [WeekMenuModule, WeekScheduleModule],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
