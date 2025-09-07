import { Module } from '@nestjs/common';

import { RestaurantSettingsController } from './restaurant.controller';
import { RestaurantSettingsService } from './restaurant.service';

@Module({
  controllers: [RestaurantSettingsController],
  providers: [RestaurantSettingsService],
  exports: [RestaurantSettingsService],
})
export class RestaurantModule {}
