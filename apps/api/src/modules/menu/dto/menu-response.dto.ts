import { ApiProperty } from '@nestjs/swagger';

export class MenuResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the menu',
    example: 6,
    type: 'integer',
  })
  id: number;

  @ApiProperty({
    description: 'Name of the menu',
    example: 'A menu',
    type: 'string',
  })
  menuName: string;

  @ApiProperty({
    description:
      'The price of the menu in the smallest currency unit (e.g., cents)',
    example: 2999,
    type: 'number',
  })
  price: number;

  @ApiProperty({
    description: 'The availability date of the menu in YYYY-MM-DD format',
    example: '2025-01-01',
    type: 'string',
    format: 'date',
  })
  availability: string;

  @ApiProperty({
    description: 'Array of dish IDs included in the menu',
    example: [9, 12],
    type: 'integer',
    isArray: true,
  })
  dishes: number[];
}
