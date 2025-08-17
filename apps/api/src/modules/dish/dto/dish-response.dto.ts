import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

import { PageMetaDto, PageOptionsDto } from '@/shared/types/pagination';

export class DishResponseDto {
  @ApiProperty({
    example: 8,
    description: 'The unique identifier of the dish',
  })
  id: number;

  @ApiProperty({
    example: 'Gulyás',
    description: 'The name of the dish',
  })
  dishName: string;

  @ApiProperty({
    example: 1,
    description: 'The ID of the dish type',
  })
  dishTypeId: number;
}

export class DishFilterDto extends PageOptionsDto {
  @ApiProperty({
    description: 'Filter by dish type ID',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  dishTypeId?: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Search term for dish name',
  })
  @IsOptional()
  @IsString()
  declare search?: string;
}

export class DishPaginatedResponseDto {
  @ApiProperty({
    type: [DishResponseDto],
    description: 'Array of dishes',
  })
  readonly data: DishResponseDto[];

  @ApiProperty({
    type: PageMetaDto,
    description: 'Pagination metadata',
  })
  readonly meta: PageMetaDto;

  constructor(data: DishResponseDto[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
