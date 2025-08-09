import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsString, Matches } from 'class-validator';

export class Dish {
  dishId: number | null;
  dishName: string | null;
  dishTypeId: number | null;
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
  weekStart: string;
  weekEnd: string;
  days: Record<string, WeekMenuDayDto>;
}
