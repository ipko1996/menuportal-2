import { ApiProperty } from '@nestjs/swagger';

import { ScheduleType, ScheduleTypeEnum } from '@/constants';

export class GetPlatformSettingsResponseDto {
  @ApiProperty({
    type: Number,
    example: 1,
    description: 'Unique identifier of the platform setting',
  })
  id: number;

  @ApiProperty({
    type: Number,
    example: 1,
    description: 'ID of the linked social media account',
  })
  socialMediaAccountId: number;

  @ApiProperty({
    type: String,
    nullable: true,
    required: false,
    example: 'Custom text for this platform!',
    description: 'Optional custom content text for this platform',
  })
  contentText: string | null;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Whether the platform is active',
  })
  isActive: boolean;
}

export class GetScheduleSettingsResponseDto {
  @ApiProperty({
    type: Number,
    example: 1,
    description: 'Unique identifier of the schedule setting',
  })
  id: number;

  @ApiProperty({
    enum: ScheduleTypeEnum.enumValues,
    example: 'WEEKLY',
    description: 'Type of schedule (e.g. DAILY, WEEKLY)',
  })
  scheduleType: ScheduleType;

  @ApiProperty({
    type: String,
    example: '09:00',
    description: 'Time of day when the post should be published (HH:mm)',
  })
  postTime: string;

  @ApiProperty({
    type: String,
    example: "Next week's menu is ready!",
    description: 'Default text for scheduled posts',
  })
  defaultContentText: string;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Whether the schedule is active',
  })
  isActive: boolean;

  @ApiProperty({
    type: () => [GetPlatformSettingsResponseDto],
    description: 'List of platform-specific settings for this schedule',
  })
  platforms: GetPlatformSettingsResponseDto[];
}
