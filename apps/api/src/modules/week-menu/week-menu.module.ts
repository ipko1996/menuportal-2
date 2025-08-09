import { Module } from '@nestjs/common';

import { WeekMenuController } from './week-menu.controller';
import { WeekMenuService } from './week-menu.service';

@Module({
  controllers: [WeekMenuController],
  providers: [WeekMenuService],
})
export class WeekMenuModule {}
