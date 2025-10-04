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

  @ApiProperty({
    description: 'The name of the connected social media account.',
    example: 'My Facebook Page',
  })
  accountName: string;
}
