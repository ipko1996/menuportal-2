import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({
    description: 'Array of dish IDs to include in the menu',
    example: [1, 2, 3],
    type: 'integer',
    isArray: true,
    minItems: 1,
  })
  @IsArray({ message: 'Dishes must be an array' })
  @IsNumber({}, { each: true, message: 'Each dish ID must be a number' })
  @IsPositive({ each: true, message: 'Each dish ID must be a positive number' })
  dishes: number[];

  @ApiProperty({
    description: 'The availability date of the menu in YYYY-MM-DD format',
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
  availability: string;

  @ApiProperty({
    description: 'Name of the menu',
    example: 'A menu',
    type: 'string',
    minLength: 1,
    maxLength: 255,
  })
  @IsString({ message: 'Menu name must be a string' })
  @IsNotEmpty({ message: 'Menu name cannot be empty' })
  menuName: string;

  @ApiProperty({
    description:
      'The price of the menu in the smallest currency unit (e.g., cents for USD)',
    example: 2999,
    type: 'number',
    minimum: 0,
  })
  @IsNumber({}, { message: 'Price must be a valid number' })
  @IsPositive({ message: 'Price must be a positive number' })
  price: number;
}
