import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  serial,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';

import { dishMenu } from './dish-menu';
import { dishType } from './dish-type';
import { offer } from './offer';
import { restaurant } from './restaurant';

export const dish = pgTable(
  'dish',
  {
    id: serial('id').primaryKey(),
    dishName: varchar('dish_name').notNull(),
    restaurantId: serial('restaurant_id')
      .notNull()
      .references(() => restaurant.id),
    dishTypeId: integer('dish_type_id')
      .notNull()
      .references(() => dishType.id),
    createdAt: timestamp('created_at', {
      mode: 'string',
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  table => [
    index('dish_restaurant_id_idx').on(table.restaurantId),
    index('dish_dish_type_id_idx').on(table.dishTypeId),
    index('dish_name_idx').on(table.dishName),

    unique('dish_name_restaurant_unique').on(
      table.dishName,
      table.restaurantId
    ),
  ]
);

export const dishRelations = relations(dish, ({ one, many }) => ({
  restaurant: one(restaurant),
  dishType: one(dishType),
  offers: many(offer),
  dishMenus: many(dishMenu),
}));

export type DishSelect = typeof dish.$inferSelect;
