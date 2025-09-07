import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
  Matches,
  ValidateNested,
} from 'class-validator';

import { DayName, DayNameEnum, dayNames } from '@/constants';

export class CreateBusinessHourDto {
  @ApiProperty({
    description: 'Day of the week',
    enum: DayNameEnum.enumValues,
    example: 'MONDAY',
  })
  @IsEnum(dayNames)
  @IsIn(DayNameEnum.enumValues)
  dayOfWeek: DayName;

  @ApiProperty({
    description: 'Opening time of the business in HH:MM format (24h)',
    example: '09:00',
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'openingTime must be in HH:MM format',
  })
  @IsNotEmpty()
  openingTime: string;

  @ApiProperty({
    description: 'Closing time of the business in HH:MM format (24h)',
    example: '18:00',
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'closingTime must be in HH:MM format',
  })
  @IsNotEmpty()
  closingTime: string;
}

export class CreateBulkBusinessHourDto {
  @ApiProperty({
    description: 'An array of business hour objects to create.',
    type: [CreateBusinessHourDto],
    example: [
      {
        dayOfWeek: 'MONDAY',
        openingTime: '09:00',
        closingTime: '17:00',
      },
      {
        dayOfWeek: 'TUESDAY',
        openingTime: '09:00',
        closingTime: '17:00',
      },
      {
        dayOfWeek: 'SATURDAY',
        openingTime: '10:00',
        closingTime: '14:00',
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateBusinessHourDto)
  businessHours: CreateBusinessHourDto[];
}
