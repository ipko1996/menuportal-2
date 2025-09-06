import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateHolidayDto {
  @ApiProperty({
    description: 'Name of the holiday',
    example: 'New Year',
    type: 'string',
    minLength: 1,
    maxLength: 255,
  })
  @IsString({ message: 'Holiday name must be a string' })
  @IsNotEmpty({ message: 'Holiday name cannot be empty' })
  name: string;

  @ApiProperty({
    description: 'The date of the holiday in YYYY-MM-DD format',
    example: '2025-01-01',
    type: 'string',
    format: 'date',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  })
  @IsString({ message: 'Availability must be a string' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Availability must be in YYYY-MM-DD format',
  })
  @IsDateString({}, { message: 'Availability must be a valid date string' })
  date: string;
}
