import { relations } from 'drizzle-orm';
import { integer, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';

import { restaurant } from './restaurant';
import { user } from './user';

export const userRestaurant = pgTable(
  'user_restaurant',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id),
    restaurantId: integer('restaurant_id')
      .notNull()
      .references(() => restaurant.id),
  },
  table => [primaryKey({ columns: [table.restaurantId, table.userId] })]
);

export const userRestaurantRelations = relations(userRestaurant, ({ one }) => ({
  user: one(user, {
    fields: [userRestaurant.userId],
    references: [user.id],
  }),
  restaurant: one(restaurant, {
    fields: [userRestaurant.userId],
    references: [restaurant.id],
  }),
}));
