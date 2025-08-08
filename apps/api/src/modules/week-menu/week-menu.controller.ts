import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { WeekMenuService } from './week-menu.service';
import { CreateWeekMenuDto } from './dto/create-week-menu.dto';
import { UpdateWeekMenuDto } from './dto/update-week-menu.dto';

@Controller('week-menu')
export class WeekMenuController {
  constructor(private readonly weekMenuService: WeekMenuService) {}

  @Post()
  create(@Body() createWeekMenuDto: CreateWeekMenuDto) {
    return this.weekMenuService.create(createWeekMenuDto);
  }

  @Get()
  findAll() {
    return this.weekMenuService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.weekMenuService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWeekMenuDto: UpdateWeekMenuDto
  ) {
    return this.weekMenuService.update(+id, updateWeekMenuDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.weekMenuService.remove(+id);
  }
}
