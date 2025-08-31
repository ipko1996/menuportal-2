import { Module } from '@nestjs/common';

import { SharedModule } from '@/shared/shared.module';

import { SnapshotService } from './snapshot.service';

@Module({
  providers: [SnapshotService],
  exports: [SnapshotService],
  imports: [SharedModule],
})
export class SnapshotModule {}
