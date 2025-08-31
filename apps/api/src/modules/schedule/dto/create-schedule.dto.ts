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

import { ScheduleType, ScheduleTypeEnum } from '@/constants';

export class PlatformCreationDto {
  @ApiProperty({
    description: 'The ID of the social media account these settings apply to.',
    example: 1,
  })
  @IsNotEmpty()
  socialMediaAccountId: number;

  @ApiProperty({
    description:
      'Custom text for this platform. If omitted, the default will be used.',
    example: "Check out next week's special menu on Facebook!",
    required: false,
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
}

// This is the main DTO for the creation request body.
export class CreateScheduleDto {
  @ApiProperty({
    description: 'The type of the schedule, e.g., WEEKLY.',
    enum: ScheduleTypeEnum.enumValues,
    example: ScheduleTypeEnum.enumValues[0],
  })
  @IsIn(ScheduleTypeEnum.enumValues)
  scheduleType: ScheduleType;

  @ApiProperty({
    description: 'The time of day to post in HH:mm format.',
    example: '09:00',
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'postTime must be in HH:mm format',
  })
  postTime: string;

  @ApiProperty({
    description:
      'The default message content to use if a platform has no custom text.',
    example: "Next week's menu is ready!",
    maxLength: 280,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(280)
  defaultContentText: string;

  @ApiProperty({
    description:
      'Array of platform-specific settings for social media posting.',
    type: [PlatformCreationDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlatformCreationDto)
  platforms: PlatformCreationDto[];
}
