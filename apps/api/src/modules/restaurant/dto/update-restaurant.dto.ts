import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class UpdateRestaurantSettingDto {
  @ApiProperty({
    description: 'The name of the restaurant.',
    example: 'The Golden Spoon',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: "The restaurant's contact phone number.",
    example: '+14155552671',
  })
  @IsPhoneNumber('HU')
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: 'The physical address of the restaurant.',
    example: '123 Main St, Anytown, USA',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'The price for takeaway orders.',
    example: 15.5,
    required: false,
  })
  @IsPositive()
  @IsNumber()
  @Min(0)
  @IsOptional()
  takeawayPrice?: number;

  @ApiProperty({
    description: 'The price for menu.',
    example: 15.5,
    required: false,
  })
  @IsPositive()
  @IsNumber()
  @Min(0)
  @IsOptional()
  menuPrice?: number;
}
