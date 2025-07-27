import { relations } from 'drizzle-orm';
import {
  index,
  integer,
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
import { user } from './user';

export const restaurant = pgTable(
  'restaurant',
  {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    userId: integer('user_id')
      .notNull()
      .unique()
      .references(() => user.id),
    phoneNumber: varchar('phone_number').notNull(),
    address: varchar('address').notNull(), // TODO
    takeawayPrice: integer('takeaway_price'),
    createdAt: timestamp('created_at', {
      mode: 'string',
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', {
      mode: 'string',
      precision: 3,
    }).$onUpdate(() => new Date().toISOString()),
  },
  (table) => [index('restaurant_name_idx').on(table.name)]
);

export const restaurantRelations = relations(restaurant, ({ many, one }) => ({
  dishes: many(dish),
  restaurantDishType: many(restaurantDishType),
  owner: one(user),
  offers: many(offer),
  menus: many(menu),
  addOns: many(addOn),
  settings: one(restaurantSetting),
}));

export type RestaurantSelect = typeof restaurant.$inferSelect;
