import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { CurrentUser } from '@/decorators/user.decorator';
import { RoleAuthGuard, Roles } from '@/guards/role.guard';
import { AppUser } from '@/shared/types';

import { CreateHolidayDto } from './dto/create-holiday.dto';
import { HolidayResponseDto } from './dto/holiday-response.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { HolidayService } from './holiday.service';

@UseGuards(RoleAuthGuard)
@Roles('ADMIN', 'MANAGER')
@ApiBearerAuth()
@Controller('holiday')
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new holiday',
    operationId: 'createHoliday',
  })
  @ApiCreatedResponse({
    description: 'Holiday has been successfully created',
    type: HolidayResponseDto,
  })
  create(
    @Body() createHolidayDto: CreateHolidayDto,
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ): Promise<HolidayResponseDto> {
    return this.holidayService.create(createHolidayDto, user.restaurant.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an existing holiday',
    operationId: 'updateHoliday',
  })
  @ApiOkResponse({
    description: 'Holiday has been successfully updated',
    type: HolidayResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHolidayDto: UpdateHolidayDto,
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ): Promise<HolidayResponseDto> {
    return this.holidayService.update(id, updateHolidayDto, user.restaurant.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a holiday', operationId: 'deleteHoliday' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ) {
    return this.holidayService.remove(id, user.restaurant.id);
  }
}
