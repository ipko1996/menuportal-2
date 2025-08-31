import { Module } from '@nestjs/common';

import { SharedModule } from '@/shared/shared.module';

import { PostModule } from '../post/post.module';
import { SnapshotModule } from '../snapshot/snapshot.module';
import { WeekMenuModule } from '../week-menu/week-menu.module';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [WeekMenuModule, SharedModule, SnapshotModule, PostModule],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
