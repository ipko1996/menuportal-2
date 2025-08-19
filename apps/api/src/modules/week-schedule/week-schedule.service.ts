import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { and, between, eq, inArray } from 'drizzle-orm';

import { snapshot, snapshotItem, snapshotMenu, snapshotOffer } from '@/schema';
import { DatabaseService } from '@/shared/database/database.service';
import { DateRange } from '@/shared/pipes';

@Injectable()
export class WeekScheduleService {
  private readonly logger = new Logger(WeekScheduleService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async getExistingSchedules(
    dateRange: DateRange,
    restaurantId: number
  ): Promise<
    (typeof snapshot.$inferSelect & {
      offers: (typeof snapshotOffer.$inferSelect)[];
      menus: (typeof snapshotMenu.$inferSelect)[];
      items: (typeof snapshotItem.$inferSelect)[];
    })[]
  > {
    const { start: startOfWeek, end: endOfWeek } = dateRange;

    return await this.databaseService.db.query.snapshot.findMany({
      where: and(
        eq(snapshot.restaurantId, restaurantId),
        between(snapshot.date, startOfWeek, endOfWeek),
        inArray(snapshot.status, ['SCHEDULED', 'PUBLISHED'])
      ),
      with: {
        offers: true,
        menus: true,
        items: true,
      },
    });
  }
}
