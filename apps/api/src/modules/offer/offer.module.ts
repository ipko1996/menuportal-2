import { Module } from '@nestjs/common';

import { DishModule } from '../dish/dish.module';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';

@Module({
  controllers: [OfferController],
  providers: [OfferService],
  imports: [DishModule],
})
export class OfferModule {}
