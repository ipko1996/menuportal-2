import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { DishtypeService } from './dishtype.service';
import { DishTypeResponseDto } from './dto/dishtype-response.dto';

@Controller('dishtype')
export class DishtypeController {
  constructor(private readonly dishtypeService: DishtypeService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all available dishtypes',
    operationId: 'getAvailableDishtypes',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available dishtypes',
    type: [DishTypeResponseDto],
  })
  findAll() {
    return this.dishtypeService.findAll();
  }
}
