import { Module } from '@nestjs/common';

import { CronHelperService } from './services/cron.helper.service';
import { EncryptionService } from './services/encryption.service';
import { R2StorageService } from './services/r2-storage.service';
import { WeeklyOfferQueryService } from './services/weekly-offer-query.service';

@Module({
  providers: [
    EncryptionService,
    CronHelperService,
    WeeklyOfferQueryService,
    R2StorageService,
  ],
  exports: [
    EncryptionService,
    CronHelperService,
    WeeklyOfferQueryService,
    R2StorageService,
  ],
})
export class SharedModule {}
