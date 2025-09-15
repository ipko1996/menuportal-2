import { Injectable, Logger } from '@nestjs/common';
import CronExpressionParser from 'cron-parser';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

import { ScheduleType } from '@/constants';

const HUNGARY_TIMEZONE = 'Europe/Budapest';

@Injectable()
export class CronHelperService {
  private readonly logger = new Logger(CronHelperService.name);

  public dayTimeToCron(scheduleType: ScheduleType, localTime: string): string {
    const localDateTimeString = `2000-01-01 ${localTime}`;

    const zonedDate = fromZonedTime(localDateTimeString, HUNGARY_TIMEZONE);
    const utcHour = zonedDate.getUTCHours();
    const utcMinute = zonedDate.getUTCMinutes();

    if (scheduleType === 'DAILY') {
      return `${utcMinute} ${utcHour} * * 0-6`;
    }
    if (scheduleType === 'WEEKLY') {
      return `${utcMinute} ${utcHour} * * 1`;
    }

    throw new Error(`Unsupported schedule type: "${scheduleType}".`);
  }
  /**
   * Converts a cron expression string back to a schedule type and time string.
   * @param cronExpression The cron expression to parse.
   * @returns An object containing the schedule type and time.
   */
  public cronToDayTime(cronExpression: string): {
    day: ScheduleType;
    time: string;
  } {
    const parts = cronExpression.split(' ');
    if (parts.length !== 5) {
      this.logger.error(`Invalid cron expression format: "${cronExpression}"`);
      throw new Error(`Invalid cron expression format: "${cronExpression}"`);
    }

    const [minute, hour, , , dayOfWeek] = parts;

    // Create a date object with the UTC time from the cron expression
    const utcDate = new Date();
    utcDate.setUTCHours(Number(hour), Number(minute), 0, 0);

    // Convert the UTC date to the target timezone
    const zonedDate = toZonedTime(utcDate, HUNGARY_TIMEZONE);

    // Format the time in HH:mm format
    const formattedHour = String(zonedDate.getHours()).padStart(2, '0');
    const formattedMinute = String(zonedDate.getMinutes()).padStart(2, '0');
    const formattedTime = `${formattedHour}:${formattedMinute}`;

    let scheduleType: ScheduleType;

    if (dayOfWeek === '1') {
      scheduleType = 'WEEKLY';
    } else if (dayOfWeek === '0-6' || dayOfWeek === '*') {
      scheduleType = 'DAILY';
    } else {
      this.logger.error(
        `Unsupported day of week in cron expression: "${dayOfWeek}"`
      );
      throw new Error(
        `Unsupported day of week in cron expression: "${dayOfWeek}"`
      );
    }

    return { day: scheduleType, time: formattedTime };
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
        tz: HUNGARY_TIMEZONE,
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
