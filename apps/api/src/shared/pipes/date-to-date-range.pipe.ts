import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { format, getISOWeek, getYear, isValid, parse } from 'date-fns';

import { DateRange } from './date-range.interface';

const DATE_FORMAT = 'yyyy-MM-dd';

/**
 * A custom NestJS pipe that validates and transforms a string in 'YYYY-MM-DD' format
 * into a DateRange object where the start and end dates are the same.
 *
 * @throws {BadRequestException} if the format is incorrect or the date is invalid.
 */
@Injectable()
export class DateToDateRangePipe implements PipeTransform<string, DateRange> {
  transform(value: string, metadata: ArgumentMetadata): DateRange {
    if (!value || typeof value !== 'string') {
      throw new BadRequestException(
        `Validation failed: ${metadata.data} must be a date string.`
      );
    }

    const parsedDate = parse(value, DATE_FORMAT, new Date());

    if (!isValid(parsedDate) || format(parsedDate, DATE_FORMAT) !== value) {
      throw new BadRequestException(
        'Invalid date. Please use a valid YYYY-MM-DD format.'
      );
    }

    const dateString = format(parsedDate, DATE_FORMAT);

    return {
      year: getYear(parsedDate),
      weekNumber: getISOWeek(parsedDate),
      start: dateString,
      end: dateString,
    };
  }
}
