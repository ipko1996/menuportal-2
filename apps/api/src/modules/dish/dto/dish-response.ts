import { ApiProperty } from '@nestjs/swagger';

export class DishResponseDto {
  @ApiProperty({
    example: 8,
    description: 'The unique identifier of the dish',
  })
  id: number;

  @ApiProperty({
    example: 'Gulyás',
    description: 'The name of the dish',
  })
  dishName: string;

  @ApiProperty({
    example: 2,
    description: 'The ID of the restaurant this dish belongs to',
  })
  restaurantId: number;

  @ApiProperty({
    example: 1,
    description: 'The ID of the dish type',
  })
  dishTypeId: number;
}
