import { relations } from 'drizzle-orm';
import {
  decimal,
  index,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

import { addOn } from './add-on';
import { dish } from './dish';
import { menu } from './menu';
import { offer } from './offer';
import { restaurantDishType } from './restaurant-dish-type';
import { restaurantSetting } from './restaurant-setting';
import { userRestaurant } from './user-restaurant';

export const restaurant = pgTable(
  'restaurant',
  {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    phoneNumber: varchar('phone_number').notNull(),
    address: varchar('address').notNull(),
    takeawayPrice: decimal('takeaway_price', {
      mode: 'number',
      precision: 5,
      scale: 0,
    }),
    createdAt: timestamp('created_at', {
      mode: 'string',
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  table => [index('restaurant_name_idx').on(table.name)]
);

export const restaurantRelations = relations(restaurant, ({ many, one }) => ({
  dishes: many(dish),
  restaurantDishType: many(restaurantDishType),
  users: one(userRestaurant),
  offers: many(offer),
  menus: many(menu),
  addOns: many(addOn),
  settings: one(restaurantSetting),
}));

export type RestaurantSelect = typeof restaurant.$inferSelect;
