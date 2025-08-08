import { ApiProperty } from '@nestjs/swagger';

export class OfferResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the offer',
    example: 1,
    type: 'integer',
    minimum: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The unique identifier of the dish associated with this offer',
    example: 123,
    type: 'integer',
    minimum: 1,
  })
  dishId: number;

  @ApiProperty({
    description:
      'The price of the offer in the smallest currency unit (e.g., cents for USD)',
    example: 1299,
    type: 'number',
    minimum: 0,
  })
  price: number;

  @ApiProperty({
    description: 'The availability date of the offer in YYYY-MM-DD format',
    example: '2025-01-01',
    type: 'string',
    format: 'date',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  })
  availability: string;
}
