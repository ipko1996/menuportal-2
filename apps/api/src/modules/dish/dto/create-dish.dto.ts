import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateDishDto {
  @ApiProperty({
    description: 'Name of the dish',
    example: 'Gulyás',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  dishName: string;

  @ApiProperty({
    description: 'ID of the dish type category',
    example: 1,
    type: Number,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  dishTypeId: number;
}
