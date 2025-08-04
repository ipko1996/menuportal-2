import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

import { DishTypeValueEnum } from '../constants';
import { dish } from './dish';
import { restaurantDishType } from './restaurant-dish-type';

export const dishType = pgTable(
  'dish_type',
  {
    id: serial('id').primaryKey(),
    dishTypeName: varchar('dishTypeName').notNull(),
    dishTypeValue: DishTypeValueEnum().notNull(),
    createdAt: timestamp('created_at', {
      mode: 'string',
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    enabled: boolean('enabled').default(false).notNull(),
  },
  table => [index('dish_type_name_idx').on(table.dishTypeName)]
);

export const dishTypeRelations = relations(dishType, ({ many }) => ({
  dishes: many(dish),
  restaurantDishType: many(restaurantDishType),
}));

export type DishTypeSelect = typeof dishType.$inferSelect;
