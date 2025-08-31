import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateScheduleDto {
  @ApiProperty({
    description: 'The time of day to post in HH:mm format.',
    example: '10:30',
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'postTime must be in HH:mm format',
  })
  postTime: string;

  @ApiProperty({
    description: 'The default message content for posts.',
    example: "This week's delicious menu is now available!",
    maxLength: 280,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(280)
  defaultContentText: string;

  @ApiProperty({
    description:
      'A master switch to globally enable or disable this entire schedule.',
    example: false,
  })
  @IsBoolean()
  isActive: boolean;
}

export class UpdatePlatformScheduleDto {
  @ApiProperty({
    type: String,
    description:
      'The custom text for this specific platform. Send null to revert to the default text.',
    example: 'Our new menu is here! #FoodieFriday',
    required: false,
    nullable: true,
  })
  @IsString()
  @MaxLength(280)
  @IsOptional()
  contentText?: string | null;

  @ApiProperty({
    type: Boolean,
    description: 'Enable or disable posting just for this platform.',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;
}
