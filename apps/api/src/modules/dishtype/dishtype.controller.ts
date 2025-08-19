import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { RoleAuthGuard, Roles } from '@/guards/role.guard';

import { WeekMenuDayDto } from '../week-menu/dto/week-menu-response.dto';
import { DishtypeService } from './dishtype.service';
import { DishTypeResponseDto } from './dto/dishtype-response.dto';

@ApiExtraModels(WeekMenuDayDto)
@UseGuards(RoleAuthGuard)
@Roles('ADMIN', 'MANAGER')
@ApiBearerAuth()
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
