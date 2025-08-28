import { Module } from '@nestjs/common';

import { SharedModule } from '@/shared/shared.module';

import { SnapshotModule } from '../snapshot/snapshot.module';
import { WeekMenuModule } from '../week-menu/week-menu.module';
import { WeekScheduleModule } from '../week-schedule/week-schedule.module';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [WeekMenuModule, WeekScheduleModule, SharedModule, SnapshotModule],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
