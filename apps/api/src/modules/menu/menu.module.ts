import { Module } from '@nestjs/common';

import { DishModule } from '../dish/dish.module';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';

@Module({
  controllers: [MenuController],
  providers: [MenuService],
  imports: [DishModule],
})
export class MenuModule {}
