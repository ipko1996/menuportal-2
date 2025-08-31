import { ApiProperty } from '@nestjs/swagger';

import {
  SocialMediaPlatform,
  SocialMediaPlatformEnum,
  socialMediaPlatformValues,
} from '@/constants';

export class SocialDto {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the social account',
  })
  id: number;

  @ApiProperty({
    enum: SocialMediaPlatformEnum.enumValues,
    description: 'Social media platform',
    example: socialMediaPlatformValues[0],
  })
  platform: SocialMediaPlatform;

  @ApiProperty({
    example: true,
    description: 'Whether the social account is active',
  })
  isActive: boolean;

  @ApiProperty({
    example: '2025-12-31T23:59:59Z',
    nullable: true,
    description: 'Token expiration date in ISO format, or null if not set',
  })
  tokenExpiresAt: string | null;
}
