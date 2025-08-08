import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

export class CreateOfferDto {
  @ApiProperty({
    description: 'The unique identifier of the dish for this offer',
    example: 123,
    type: 'integer',
    minimum: 1,
  })
  @IsNumber({}, { message: 'Dish ID must be a valid number' })
  @IsPositive({ message: 'Dish ID must be a positive number' })
  dishId: number;

  @ApiProperty({
    description:
      'The price of the offer in the smallest currency unit (e.g., cents for USD)',
    example: 1299,
    type: 'number',
    minimum: 0,
  })
  @IsNumber({}, { message: 'Price must be a valid number' })
  @IsPositive({ message: 'Price must be a positive number' })
  price: number;

  @ApiProperty({
    description: 'The availability date of the offer in YYYY-MM-DD format',
    example: '2025-01-01',
    type: 'string',
    format: 'date',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  })
  @IsString({ message: 'Availability must be a string' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Availability must be in YYYY-MM-DD format',
  })
  @IsDateString(
    {},
    {
      message: 'Availability must be a valid date string',
    }
  )
  availability: string;
}
