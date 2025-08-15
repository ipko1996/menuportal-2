import { ApiProperty } from '@nestjs/swagger';

import { DishType, DishTypeValueEnum } from '@/constants';

export class DishTypeResponseDto {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the dish type',
  })
  id: number;

  @ApiProperty({ example: 'Leves', description: 'The name of the dish type' })
  name: string;

  @ApiProperty({
    enum: DishTypeValueEnum.enumValues,
    example: 'SOUP',
    description: 'The type value of the dish',
  })
  dishTypeValue: DishType;
}
