import { Module } from '@nestjs/common';

import { CronHelperService } from './services/cron.helper.service';
import { EncryptionService } from './services/encryption.service';
import { WeeklyOfferQueryService } from './services/weekly-offer-query.service';

@Module({
  providers: [EncryptionService, CronHelperService, WeeklyOfferQueryService],
  exports: [EncryptionService, CronHelperService, WeeklyOfferQueryService],
})
export class SharedModule {}
