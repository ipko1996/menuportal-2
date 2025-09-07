import { ApiProperty } from '@nestjs/swagger';

import { DayName, DayNameEnum } from '@/constants';

export class BusinessHourResponseDto {
  @ApiProperty({
    description: 'The unique identifier for the business hour entry.',
    example: 101,
  })
  id: number;

  @ApiProperty({
    description: 'Day of the week.',
    enum: DayNameEnum.enumValues,
    example: 'MONDAY',
  })
  dayOfWeek: DayName;

  @ApiProperty({
    description: 'Opening time in HH:MM format.',
    example: '09:00',
  })
  openingTime: string;

  @ApiProperty({
    description: 'Closing time in HH:MM format.',
    example: '17:00',
  })
  closingTime: string;
}
