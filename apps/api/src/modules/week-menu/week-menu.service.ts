import { Injectable } from '@nestjs/common';
import { CreateWeekMenuDto } from './dto/create-week-menu.dto';
import { UpdateWeekMenuDto } from './dto/update-week-menu.dto';

@Injectable()
export class WeekMenuService {
  create(createWeekMenuDto: CreateWeekMenuDto) {
    return 'This action adds a new weekMenu';
  }

  findAll() {
    return `This action returns all weekMenu`;
  }

  findOne(id: number) {
    return `This action returns a #${id} weekMenu`;
  }

  update(id: number, updateWeekMenuDto: UpdateWeekMenuDto) {
    return `This action updates a #${id} weekMenu`;
  }

  remove(id: number) {
    return `This action removes a #${id} weekMenu`;
  }
}
