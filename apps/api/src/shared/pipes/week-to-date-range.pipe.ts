import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { endOfISOWeek, format, isValid, parse, startOfISOWeek } from 'date-fns';

export interface DateRange {
  year: number;
  weekNumber: number;
  start: string;
  end: string;
}

@Injectable()
export class WeekToDateRangePipe implements PipeTransform<string, DateRange> {
  transform(value: string, metadata: ArgumentMetadata): DateRange {
    const isoWeekRegex = /^\d{4}-W\d{2}$/;
    if (!isoWeekRegex.test(value)) {
      throw new BadRequestException(
        "Invalid week format. Please use 'YYYY-Www', e.g., '2025-W32'."
      );
    }

    const parsedDate = parse(value, "RRRR-'W'II", new Date());

    if (!isValid(parsedDate)) {
      throw new BadRequestException(
        `Invalid week number provided: '${value}'. The week does not exist.`
      );
    }

    return {
      year: parsedDate.getFullYear(),
      weekNumber: Number.parseInt(format(parsedDate, 'ww'), 10),
      start: format(startOfISOWeek(parsedDate), 'yyyy-MM-dd'),
      end: format(endOfISOWeek(parsedDate), 'yyyy-MM-dd'),
    };
  }
}
