import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '@/decorators/user.decorator';
import { RoleAuthGuard, Roles } from '@/guards/role.guard';
import { AppUser } from '@/shared/types';

import { BusinessHoursService } from './business-hours.service';
import { BusinessHourResponseDto } from './dto/business-hour-response.dto';
import {
  CreateBulkBusinessHourDto,
  CreateBusinessHourDto,
} from './dto/create-business-hour.dto';
import { UpdateBusinessHourDto } from './dto/update-business-hour.dto';

@ApiTags('Business Hours')
@UseGuards(RoleAuthGuard)
@Roles('ADMIN', 'MANAGER')
@ApiBearerAuth()
@Controller('business-hours')
export class BusinessHoursController {
  constructor(private readonly businessHoursService: BusinessHoursService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a single business hour entry',
    description:
      'Adds a new opening/closing time for a specific day of the week.',
    operationId: 'createBusinessHour',
  })
  @ApiCreatedResponse({
    description: 'The business hour has been successfully created.',
    type: BusinessHourResponseDto,
  })
  create(
    @Body() createBusinessHourDto: CreateBusinessHourDto,
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ) {
    return this.businessHoursService.create(
      createBusinessHourDto,
      user.restaurant.id
    );
  }

  @Post('bulk')
  @ApiOperation({
    summary: 'Create multiple business hour entries at once',
    description:
      'Allows for setting up the business hours for multiple days in a single request.',
    operationId: 'createBulkBusinessHours',
  })
  @ApiBody({ type: CreateBulkBusinessHourDto })
  @ApiCreatedResponse({
    description: 'The business hours have been successfully created.',
    type: [BusinessHourResponseDto],
  })
  createBulk(
    @Body() createBusinessHourDtos: CreateBulkBusinessHourDto,
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ) {
    return this.businessHoursService.createBulk(
      createBusinessHourDtos,
      user.restaurant.id
    );
  }

  @Get()
  @ApiOperation({
    summary: "Retrieve all of a restaurant's business hours",
    description:
      'Returns a list of all business hours, sorted by the day of the week.',
    operationId: 'findAllBusinessHours',
  })
  @ApiOkResponse({
    description: 'A list of business hours.',
    type: [BusinessHourResponseDto],
  })
  findAll(@CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>) {
    return this.businessHoursService.findAll(user.restaurant.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an existing business hour entry',
    operationId: 'updateBusinessHour',
  })
  @ApiOkResponse({
    description: 'The business hour has been successfully updated.',
    type: BusinessHourResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBusinessHourDto: UpdateBusinessHourDto,
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ) {
    return this.businessHoursService.update(
      id,
      updateBusinessHourDto,
      user.restaurant.id
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a business hour entry',
    operationId: 'deleteBusinessHour',
  })
  @ApiOkResponse({
    description: 'The business hour has been successfully deleted.',
    type: BusinessHourResponseDto,
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ) {
    return this.businessHoursService.remove(id, user.restaurant.id);
  }
}
