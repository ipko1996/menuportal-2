import { Module } from '@nestjs/common';
import { WeekMenuService } from './week-menu.service';
import { WeekMenuController } from './week-menu.controller';

@Module({
  controllers: [WeekMenuController],
  providers: [WeekMenuService],
})
export class WeekMenuModule {}
