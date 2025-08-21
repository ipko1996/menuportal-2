import { Injectable } from '@nestjs/common';

import { DateRange } from '@/shared/pipes';

import { WeekMenuService } from '../week-menu/week-menu.service';
import Handlebars, { template } from './hbs/helper';

@Injectable()
export class TemplatesService {
  constructor(private readonly weekMenuService: WeekMenuService) {}

  async renderMenuForWeek(restaurantId: number, dateRange: DateRange) {
    const weekMenu = await this.weekMenuService.getMenusForWeek(
      dateRange,
      restaurantId
    );
    console.log('Rendering menu for week:', weekMenu);

    const compiled = Handlebars.compile(template);
    return compiled(weekMenu);
  }
}
