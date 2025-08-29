import { Module } from '@nestjs/common';

import { SharedModule } from '@/shared/shared.module';

import { PostModule } from '../post/post.module';
import { SnapshotModule } from '../snapshot/snapshot.module';
import { WeekMenuController } from './week-menu.controller';
import { WeekMenuService } from './week-menu.service';

@Module({
  controllers: [WeekMenuController],
  providers: [WeekMenuService],
  exports: [WeekMenuService],
  imports: [SharedModule, PostModule, SnapshotModule],
})
export class WeekMenuModule {}
