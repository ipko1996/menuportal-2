import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { MenuStatusApi, MenuStatusApiValues } from '@/constants';

export class Dish {
  @ApiProperty({
    description: 'Unique identifier for the dish',
    example: 9,
    nullable: true,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  dishId: number | null;

  @ApiProperty({
    description: 'Name of the dish',
    example: 'Gulyás',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  dishName: string | null;

  @ApiProperty({
    description:
      'Type identifier for the dish (1: soup, 2: main course, 3: dessert, etc.)',
    example: 1,
    nullable: true,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  dishTypeId: number | null;
}

export class DayOffersDto {
  @ApiProperty({
    description: 'Unique identifier for the offer',
    example: 6,
    type: Number,
  })
  @IsNumber()
  offerId: number;

  @ApiProperty({
    description: 'Price of the offer in Hungarian Forint (HUF)',
    example: 1400,
    type: Number,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Dish details for this offer',
    type: Dish,
    example: {
      dishId: 9,
      dishName: 'Gulyás',
      dishTypeId: 1,
    },
  })
  @ValidateNested()
  @Type(() => Dish)
  dish: Dish;
}

export class DayMenuDto {
  @ApiProperty({
    description: 'Unique identifier for the menu',
    example: 8,
    type: Number,
  })
  @IsNumber()
  menuId: number;

  @ApiProperty({
    description: 'Name of the menu',
    example: 'A menu',
    type: String,
  })
  @IsString()
  menuName: string;

  @ApiProperty({
    description: 'List of dishes included in this menu',
    type: [Dish],
    example: [
      {
        dishId: 40,
        dishName: 'Halászlé',
        dishTypeId: 1,
      },
      {
        dishId: 41,
        dishName: 'Krumplistészta',
        dishTypeId: 3,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Dish)
  dishes: Dish[];

  @ApiProperty({
    description: 'Total price of the menu in Hungarian Forint (HUF)',
    example: 2999,
    type: Number,
  })
  @IsNumber()
  price: number;
}

export class WeekMenuDayDto {
  @ApiProperty({
    description: 'List of individual dish offers for the day',
    type: [DayOffersDto],
    example: [
      {
        offerId: 6,
        dish: {
          dishId: 9,
          dishName: 'Gulyás',
          dishTypeId: 1,
        },
        price: 1400,
      },
      {
        offerId: 7,
        dish: {
          dishId: 39,
          dishName: 'Palacsinta',
          dishTypeId: 3,
        },
        price: 1299,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayOffersDto)
  offers: DayOffersDto[];

  @ApiProperty({
    description: 'List of complete menus available for the day',
    type: [DayMenuDto],
    example: [
      {
        menuId: 8,
        menuName: 'A menu',
        price: 2999,
        dishes: [
          {
            dishId: 40,
            dishName: 'Halászlé',
            dishTypeId: 1,
          },
          {
            dishId: 41,
            dishName: 'Mákos tészta',
            dishTypeId: 3,
          },
        ],
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayMenuDto)
  menus: DayMenuDto[];
}

export class WeekMenuResponseDto {
  @ApiProperty({
    description: 'Start date of the week in ISO date format (YYYY-MM-DD)',
    example: '2025-08-04',
    type: String,
  })
  @IsString()
  weekStart: string;

  @ApiProperty({
    description: 'End date of the week in ISO date format (YYYY-MM-DD)',
    example: '2025-08-10',
    type: String,
  })
  @IsString()
  weekEnd: string;

  @ApiProperty({
    description: 'Status of the weekly menu',
    enum: MenuStatusApiValues,
    example: 'DRAFT',
  })
  weekStatus: MenuStatusApi;

  posts: Array<{ postId: number; status: MenuStatusApi }>;

  @ApiProperty({
    description: 'Reason for failure if the week menu failed to be published',
    example: 'Database connection error',
    type: String,
    nullable: true,
  })
  failureReason?: string;

  @ApiProperty({
    description: 'Daily menu data indexed by date (YYYY-MM-DD format)',
    type: 'object',
    additionalProperties: { $ref: getSchemaPath(WeekMenuDayDto) },
    example: {
      '2025-08-04': {
        offers: [],
        menus: [],
      },
      '2025-08-05': {
        offers: [],
        menus: [],
      },
      '2025-08-06': {
        offers: [
          {
            offerId: 6,
            dish: {
              dishId: 9,
              dishName: 'Gulyás',
              dishTypeId: 1,
            },
            price: 1400,
          },
          {
            offerId: 7,
            dish: {
              dishId: 39,
              dishName: 'Palacsinta',
              dishTypeId: 3,
            },
            price: 1299,
          },
        ],
        menus: [],
      },
      '2025-08-07': {
        offers: [],
        menus: [
          {
            menuId: 8,
            menuName: 'A menu',
            price: 2999,
            dishes: [
              {
                dishId: 40,
                dishName: 'Halászlé',
                dishTypeId: 1,
              },
              {
                dishId: 41,
                dishName: 'Krumplistészta',
                dishTypeId: 3,
              },
            ],
          },
        ],
      },
      '2025-08-08': {
        offers: [],
        menus: [
          {
            menuId: 6,
            menuName: 'B menu',
            price: 4000,
            dishes: [
              {
                dishId: 9,
                dishName: 'Gulyás',
                dishTypeId: 1,
              },
              {
                dishId: 12,
                dishName: 'Spagetti',
                dishTypeId: 3,
              },
            ],
          },
          {
            menuId: 7,
            menuName: 'A menu',
            price: 2999,
            dishes: [
              {
                dishId: 40,
                dishName: 'Halászlé',
                dishTypeId: 1,
              },
              {
                dishId: 41,
                dishName: 'Spaghetti',
                dishTypeId: 3,
              },
            ],
          },
        ],
      },
      '2025-08-09': {
        offers: [],
        menus: [],
      },
      '2025-08-10': {
        offers: [],
        menus: [],
      },
    } as Record<string, WeekMenuDayDto>,
  })
  @IsDefined()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => WeekMenuDayDto)
  days: Record<string, WeekMenuDayDto>;

  @ApiProperty({
    description: 'Indicates if the week menu is empty (no offers or menus)',
    example: false,
    type: Boolean,
  })
  isEmpty: boolean;

  @ApiProperty({
    description: 'Indicates if the week is in the past',
    example: false,
    type: Boolean,
  })
  isPast: boolean;

  @ApiProperty({
    description: 'Indicates if the week is the current week',
    example: true,
    type: Boolean,
  })
  isCurrentWeek: boolean;

  @ApiProperty({
    description: 'Indicates if the week is the planning week',
    example: false,
    type: Boolean,
  })
  isPlanningWeek: boolean;
}
