import { ApiProperty } from '@nestjs/swagger';

import { PageOptionsDto } from './page-options.dto';

export interface PageMetaDtoParameters {
  pageOptionsDto: PageOptionsDto;
  itemCount: number;
}

export class PageMetaDto {
  @ApiProperty({
    description: 'Current page number',
  })
  readonly page: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
  })
  readonly limit: number;

  @ApiProperty({
    description: 'Total number of items across all pages',
  })
  readonly itemCount: number;

  @ApiProperty({
    description: 'Total number of pages',
  })
  readonly pageCount: number;

  @ApiProperty({
    description: 'Whether a previous page exists',
  })
  readonly hasPreviousPage: boolean;

  @ApiProperty({
    description: 'Whether a next page exists',
  })
  readonly hasNextPage: boolean;

  constructor({ pageOptionsDto, itemCount }: PageMetaDtoParameters) {
    this.page = pageOptionsDto.page ?? 1; // Default to 1 if undefined
    this.limit = pageOptionsDto.limit ?? 10; // Default to 10 if undefined
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.limit);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
