import { ApiProperty } from '@nestjs/swagger';

import {
  SocialMediaPlatform,
  SocialMediaPlatformEnum,
  socialMediaPlatformValues,
} from '@/constants';

export class SocialAccountDto {
  @ApiProperty({
    description: 'The social media platform.',
    enum: SocialMediaPlatformEnum.enumValues,
    example: socialMediaPlatformValues[0],
  })
  platform: SocialMediaPlatform;

  @ApiProperty({
    description: 'Indicates if auto-posting is enabled for this platform.',
    example: true,
  })
  isActive: boolean;
}
