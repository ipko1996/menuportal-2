import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber } from 'class-validator';

import { DishType, DishTypeValueEnum } from '@/constants';

export class BaseDishTypeResponseDto {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the dish type',
  })
  dishTypeId: number;

  @ApiProperty({ example: 'Leves', description: 'The name of the dish type' })
  name: string;

  @ApiProperty({
    enum: DishTypeValueEnum.enumValues,
    example: 'SOUP',
    description: 'The type value of the dish',
  })
  dishTypeValue: DishType;
}

export class DishTypeWithDataResponseDto extends BaseDishTypeResponseDto {
  @ApiProperty({
    example: 500,
    description: 'The price associated with the dish type for the restaurant',
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    example: true,
    description: 'Indicates if the dish type is active for the restaurant',
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    example: false,
    description: 'Indicates if the dish type is visible on the menu',
  })
  @IsBoolean()
  isOnTheMenu: boolean;
}
