// TypeScript interfaces for the menu data structure

export interface DateRange {
  start: string;
  end: string;
}

export interface Dish {
  dishId: number;
  dishName: string;
  dishTypeId: number;
}

export interface Offer {
  offerId: number;
  dish: Dish;
  price: number;
}

export interface Menu {
  menuId: number;
  menuName: string;
  price: number;
  dishes: Dish[];
}

export interface DayData {
  offers: Offer[];
  menus: Menu[];
}

export interface WeekMenuResponseDto {
  weekStatus: string;
  weekStart: string;
  weekEnd: string;
  days: Record<string, DayData>;
  isEmpty: boolean;
  isPast: boolean;
  isCurrentWeek: boolean;
  isPlanningWeek: boolean;
}

export interface DayWithName {
  dayName: string;
  dayData: DayData;
}
