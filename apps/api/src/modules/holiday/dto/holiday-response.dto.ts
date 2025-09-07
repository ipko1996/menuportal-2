import { ApiProperty } from '@nestjs/swagger';

export class HolidayResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the holiday',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the holiday',
    example: 'Christmas Day',
  })
  name: string;

  @ApiProperty({
    description: 'Date of the holiday in YYYY-MM-DD format',
    example: '2025-12-25',
    type: String,
    format: 'date',
  })
  date: string;

  @ApiProperty({
    description: 'ID of the associated restaurant',
    example: 42,
  })
  restaurantId: number;
}
