import { Injectable, Logger } from '@nestjs/common';
import { CronExpressionParser } from 'cron-parser';

import { DayName, dayNames } from '@/constants';

@Injectable()
export class CronHelperService {
  private readonly logger = new Logger(CronHelperService.name);

  public dayTimeToCron(day: DayName, time: string): string {
    const timeParts = time.split(':');

    // Validate that the time is in HH:mm format
    if (timeParts.length !== 2) {
      console.error(`Invalid time format: "${time}". Expected "HH:mm".`);
      throw new Error(`Invalid time format: "${time}". Expected "HH:mm".`);
    }

    const [hour, minute] = timeParts;

    const dayOfWeekMap: Record<DayName, number> = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    };

    const dayOfWeek = dayOfWeekMap[day];

    return `${minute} ${hour} * * ${dayOfWeek}`;
  }

  public cronToDayTime(cron: string): { day: DayName; time: string } {
    // This will not throw since the cron expression is validated beforehand
    const interval = CronExpressionParser.parse(cron);
    const nextOccurrence = interval.next().toDate();

    const day = dayNames[nextOccurrence.getDay()];

    const hour = String(nextOccurrence.getHours()).padStart(2, '0');
    const minute = String(nextOccurrence.getMinutes()).padStart(2, '0');
    const time = `${hour}:${minute}`;

    return { day, time };
  }

  getNextScheduledAt(cronExpression: string): string {
    try {
      // Parse the cron expression with timezone support
      const interval = CronExpressionParser.parse(cronExpression);

      // Get the next execution time
      const next = interval.next().toISOString();
      if (!next) {
        throw new Error('No next execution time found');
      }
      return next;
    } catch (error) {
      throw new Error(
        `Invalid cron expression: ${cronExpression}. Error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}
