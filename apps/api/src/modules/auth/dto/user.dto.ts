import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Length, Min } from 'class-validator';

import { UserSelect } from '../../../schema';

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
