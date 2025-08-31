import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { SocialMediaPlatform, socialMediaPlatformValues } from '@/constants';

export class MenuQueryDto {
  @ApiProperty({
    required: false,
    description:
      'Specify a platform for a custom template. Omit for the default menu.',
    enum: socialMediaPlatformValues,
  })
  @IsOptional()
  @IsEnum(socialMediaPlatformValues)
  platform?: SocialMediaPlatform;
}

export class GenerateMenuQueryDto extends MenuQueryDto {
  @ApiProperty({
    required: false,
    description: "The output format. Defaults to 'pdf'.",
    enum: ['pdf', 'png'],
  })
  @IsOptional()
  @IsEnum(['pdf', 'png'])
  format?: 'pdf' | 'png';
}
