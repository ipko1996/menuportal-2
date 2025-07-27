import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

import { dishTypeValues } from '../constants';
import { dish } from './dish';
import { restaurantDishType } from './restaurant-dish-type';

export const DishTypeValueEnum = pgEnum('dish_type_value', dishTypeValues);

export const dishType = pgTable(
  'dish_type',
  {
    id: serial('id').primaryKey(),
    dishTypeName: varchar('dishTypeName').notNull(),
    dishTypeValue: DishTypeValueEnum().notNull(),
    createdAt: timestamp('created_at', {
      mode: 'string',
    })
      .defaultNow()
      .notNull(),
    disabled: boolean('disabled').default(true).notNull(),
    updatedAt: timestamp('updated_at', {
      mode: 'string',
      precision: 3,
    }).$onUpdate(() => new Date().toISOString()),
  },
  table => [index('dish_type_name_idx').on(table.dishTypeName)]
);

export const dishTypeRelations = relations(dishType, ({ many }) => ({
  dishes: many(dish),
  restaurantDishType: many(restaurantDishType),
}));

export type DishTypeSelect = typeof dishType.$inferSelect;
