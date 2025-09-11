import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';

class RestaurantDishTypeSettingDto {
  @ApiProperty({
    description: 'The unique identifier of the dish type.',
    example: 42,
  })
  @IsInt()
  dishTypeId: number;

  @ApiProperty({
    description: 'The price of the dish type in the restaurant.',
    example: 12,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Whether the dish type is currently active.',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Whether the dish type is visible on the menu.',
    example: false,
  })
  @IsBoolean()
  isOnTheMenu: boolean;
}

export class UpdateRestaurantDishTypesDto {
  @ApiProperty({
    description: 'The list of dish type settings to update.',
    type: [RestaurantDishTypeSettingDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RestaurantDishTypeSettingDto)
  settings: RestaurantDishTypeSettingDto[];
}
