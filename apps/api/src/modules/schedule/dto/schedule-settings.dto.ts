import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

import { DayName } from '@/constants';

export class UpdateScheduleSettingsDto {
  @ApiProperty({
    description: 'Enable or disable the weekly scheduling.',
    example: true,
  })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({
    description: 'The day of the week to post the menu.',
    enum: ['SATURDAY', 'SUNDAY', 'MONDAY'],
    example: 'SUNDAY',
  })
  @IsIn(['SATURDAY', 'SUNDAY', 'MONDAY'])
  postDay: DayName;

  @ApiProperty({
    description: 'The time of day to post in HH:mm format.',
    example: '18:00',
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'postTime must be in HH:mm format',
  })
  postTime: string;

  @ApiProperty({
    description: 'The message content to include in the social media post.',
    example: "Next week's menu is ready!",
    maxLength: 280,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(280)
  message: string;
}

export class GetScheduleSettingsResponseDto extends UpdateScheduleSettingsDto {}
