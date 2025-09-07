import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class RestaurantSettingResponseDto {
  @ApiProperty({
    description: 'The unique identifier for the restaurant.',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The name of the restaurant.',
    example: 'The Golden Spoon',
  })
  name: string;

  @ApiProperty({
    description: "The restaurant's contact phone number.",
    example: '+14155552671',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'The physical address of the restaurant.',
    example: '123 Main St, Anytown, USA',
  })
  address: string;

  @ApiProperty({
    description: 'The price for takeaway orders.',
    example: 15.5,
  })
  @IsNumber()
  @IsOptional()
  takeawayPrice?: number;
}
