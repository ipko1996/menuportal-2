import { Injectable, Logger, NotImplementedException } from '@nestjs/common';

import { DatabaseService } from '@/shared/database/database.service';
import { DateRange } from '@/shared/pipes/week-to-date-range.pipe';

import { WeekMenuResponseDto } from './dto/week-menu-response.dto';

@Injectable()
export class WeekMenuService {
  private readonly logger = new Logger(WeekMenuService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async getMenusForWeek(dateRange: DateRange): Promise<WeekMenuResponseDto> {
    this.logger.log(
      `Fetching menus for week: ${dateRange.start} to ${dateRange.end}`
    );
    throw new NotImplementedException(
      'getMenusForWeek method is not implemented yet'
    );
  }
}
