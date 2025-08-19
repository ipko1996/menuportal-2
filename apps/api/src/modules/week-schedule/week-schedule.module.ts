import { Module } from '@nestjs/common';

import { WeekScheduleService } from './week-schedule.service';

@Module({
  exports: [WeekScheduleService],
  providers: [WeekScheduleService],
})
export class WeekScheduleModule {}
