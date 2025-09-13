import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';

import { RestaurantSelect, UserSelect } from '../../../schema';

export class RestaurantDto
  implements Omit<RestaurantSelect, 'createdAt' | 'updatedAt'>
{
  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number of the restaurant',
  })
  @IsString()
  @Length(1, 20)
  phoneNumber!: string;

  @ApiProperty({
    example: '123 Main St, Springfield',
    description: 'Address of the restaurant',
  })
  @IsString()
  @Length(1, 255)
  address!: string;

  @ApiProperty({
    example: 1,
    description: 'Unique identifier of the restaurant',
  })
  @IsInt()
  @Min(1)
  id!: number;

  @ApiProperty({
    example: 'Pizza Palace',
    description: 'Name of the restaurant',
  })
  @IsString()
  @Length(1, 255)
  name!: string;
}

export class UserDto implements Pick<UserSelect, 'id' | 'externalId'> {
  @ApiProperty({ example: 1, description: 'Unique identifier of the user' })
  @IsInt()
  @Min(1)
  id!: string;

  @ApiProperty({
    example: 'auth0|abcdef1234567890',
    description: 'External ID of the user',
  })
  @IsString()
  @Length(1, 255)
  externalId!: string;
}

export class UserDtoWithRestaurant
  implements Pick<UserSelect, 'id' | 'externalId'>
{
  @ApiProperty({ example: 1, description: 'Unique identifier of the user' })
  @IsInt()
  @Min(1)
  id!: string;

  @ApiProperty({
    example: 'auth0|abcdef1234567890',
    description: 'External ID of the user',
  })
  @IsString()
  @Length(1, 255)
  externalId!: string;

  @ApiProperty({
    description: 'Restaurant associated with the user',
    type: RestaurantDto,
    nullable: true,
  })
  @ValidateNested()
  @Type(() => RestaurantDto)
  restaurant!: RestaurantDto | null;
}
