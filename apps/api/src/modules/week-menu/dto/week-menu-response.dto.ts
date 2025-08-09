import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsString, Matches } from 'class-validator';

export class Dish {
  id: number;
  dishName: string;
  dishTypeId: number;
}

export class DayOffersDto {
  offerId: number;
  price: number;
  dish: Dish;
}
export class DayMenuDto {
  menuId: number;
  menuName: string;
  dishes: Dish[];
  price: number;
}

export class WeekMenuDayDto {
  offers: DayOffersDto[];
  menus: DayMenuDto[];
}

export class WeekMenuResponseDto {
  week: string;
  days: Record<string, WeekMenuDayDto>;
}
