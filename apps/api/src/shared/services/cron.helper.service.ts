import { Injectable, Logger } from '@nestjs/common';
import CronExpressionParser from 'cron-parser';

import { ScheduleType } from '@/constants';

@Injectable()
export class CronHelperService {
  private readonly logger = new Logger(CronHelperService.name);

  public dayTimeToCron(scheduleType: ScheduleType, time: string): string {
    const timeParts = time.split(':');

    if (timeParts.length !== 2) {
      this.logger.error(`Invalid time format: "${time}". Expected "HH:mm".`);
      throw new Error(`Invalid time format: "${time}". Expected "HH:mm".`);
    }

    const [hour, minute] = timeParts;

    if (scheduleType === 'DAILY') {
      return `${minute} ${hour} * * 0-6`;
    }
    if (scheduleType === 'WEEKLY') {
      return `${minute} ${hour} * * 1`;
    }
    this.logger.error(`Unsupported schedule type: "${scheduleType}".`);
    throw new Error(`Unsupported schedule type: "${scheduleType}".`);
  }

  /**
   * Checks if a cron expression has a scheduled run on a specific day.
   * @param cronExpression The cron expression to evaluate.
   * @param day The specific day to check against.
   * @returns The exact Date of the scheduled run if it occurs on the given day, otherwise null.
   */
  public getScheduledRunForDay(
    cronExpression: string,
    day: Date
  ): Date | undefined {
    try {
      const startOfDay = new Date(day);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const interval = CronExpressionParser.parse(cronExpression, {
        currentDate: startOfDay,
        tz: 'UTC',
      });
      const nextRun = interval.next().toDate();

      const endOfDay = new Date(day);
      endOfDay.setUTCHours(23, 59, 59, 999);

      // If the next scheduled run is within the current day, we have a match.
      if (nextRun <= endOfDay) {
        return nextRun;
      }
    } catch (error) {
      this.logger.error(
        `Could not parse invalid cron expression "${cronExpression}"`,
        error.stack
      );
    }
  }
}
