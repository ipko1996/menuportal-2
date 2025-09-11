import { relations } from 'drizzle-orm';
import {
  boolean,
  decimal,
  integer,
  pgTable,
  unique,
} from 'drizzle-orm/pg-core';

import { dishType } from './dish-type';
import { restaurant } from './restaurant';

export const restaurantDishType = pgTable(
  'restaurant_dish_type',
  {
    restaurantId: integer('restaurant_id')
      .notNull()
      .references(() => restaurant.id),
    dishTypeId: integer('dish_type_id')
      .notNull()
      .references(() => dishType.id),
    price: decimal('price', {
      mode: 'number',
      precision: 5,
      scale: 0,
    }).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    isOnTheMenu: boolean('is_on_the_menu').default(false).notNull(),
  },
  table => [
    unique('dish_type_restaurant_unique').on(
      table.restaurantId,
      table.dishTypeId
    ),
  ]
);

export const restaurantDishTypeRelations = relations(
  restaurantDishType,
  ({ one }) => ({
    restaurant: one(restaurant, {
      fields: [restaurantDishType.restaurantId],
      references: [restaurant.id],
    }),
    dishType: one(dishType, {
      fields: [restaurantDishType.dishTypeId],
      references: [dishType.id],
    }),
  })
);

export type RestaurantDishTypeSelect = typeof restaurantDishType.$inferSelect;
