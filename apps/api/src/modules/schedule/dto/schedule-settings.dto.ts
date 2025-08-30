import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { DayName, ScheduleType, ScheduleTypeEnum } from '@/constants';

export class PlatformSettingsDto {
  @ApiProperty({
    description: 'The text that will accompany the social media post.',
    example: "Next week's menu is ready!",
  })
  @IsString()
  @MaxLength(280)
  @IsOptional()
  contentText?: string;

  @ApiProperty({
    description: 'Whether posting to this social media account is active.',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'The ID of the social media account these settings apply to.',
    example: 1,
  })
  @IsNotEmpty()
  socialMediaAccountId: number;
}

export class ScheduleSettingsDto {
  @ApiProperty({
    description: 'The time of day to post in HH:mm format.',
    example: '09:00',
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
  defaultContentText: string;

  @ApiProperty({
    description: '',
    enum: ScheduleTypeEnum.enumValues,
    example: ScheduleTypeEnum.enumValues[0],
  })
  @IsIn(ScheduleTypeEnum.enumValues)
  scheduleType: ScheduleType;

  @ApiProperty({
    description:
      'Array of platform-specific settings for social media posting.',
    type: [PlatformSettingsDto],
    example: [
      {
        contentText: "Check out next week's special menu!",
        isActive: true,
        socialMediaAccountId: 1,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlatformSettingsDto)
  platforms: PlatformSettingsDto[];
}
