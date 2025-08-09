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

import { CreateMenuDto } from './dto/create-menu.dto';
import { MenuResponseDto } from './dto/menu-response.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenuService } from './menu.service';

@UseGuards(RoleAuthGuard)
@Roles('ADMIN', 'MANAGER')
@ApiBearerAuth()
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new menu' })
  @ApiCreatedResponse({
    description: 'Menu has been successfully created',
    type: MenuResponseDto,
  })
  create(
    @Body() createMenuDto: CreateMenuDto,
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ): Promise<MenuResponseDto> {
    return this.menuService.create(createMenuDto, user.restaurant.id);
  }

  @Get()
  findAll() {
    return this.menuService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing menu' })
  @ApiOkResponse({
    description: 'Menu has been successfully updated',
    type: MenuResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuDto: UpdateMenuDto,
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ) {
    return this.menuService.update(id, updateMenuDto, user.restaurant.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a menu' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ) {
    return this.menuService.remove(id, user.restaurant.id);
  }
}
