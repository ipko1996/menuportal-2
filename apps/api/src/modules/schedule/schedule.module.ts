import { Module } from '@nestjs/common';

import { WeekMenuModule } from '../week-menu/week-menu.module';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [WeekMenuModule],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
