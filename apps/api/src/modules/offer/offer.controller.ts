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
import type { AppUser } from '@/shared/types';

import { CreateOfferDto } from './dto/create-offer.dto';
import { OfferResponseDto } from './dto/offer-response.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OfferService } from './offer.service';

@UseGuards(RoleAuthGuard)
@Roles('ADMIN', 'MANAGER')
@ApiBearerAuth()
@Controller('offer')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new offer' })
  @ApiCreatedResponse({
    description: 'Offer has been successfully created',
    type: OfferResponseDto,
  })
  create(
    @Body() createOfferDto: CreateOfferDto,
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ): Promise<OfferResponseDto> {
    return this.offerService.create(createOfferDto, user.restaurant.id);
  }

  @Get()
  findAll() {
    return this.offerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an offer by ID' })
  @ApiOkResponse({
    description: 'Offer found',
    type: OfferResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<OfferResponseDto> {
    return this.offerService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing offer' })
  @ApiOkResponse({
    description: 'Offer has been successfully updated',
    type: OfferResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOfferDto: UpdateOfferDto,
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ): Promise<OfferResponseDto> {
    return this.offerService.update(id, updateOfferDto, user.restaurant.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an offer' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ) {
    return this.offerService.remove(id, user.restaurant.id);
  }
}
