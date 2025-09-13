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
import { businessHours } from './business-hours';
import { dish } from './dish';
import { holiday } from './holiday';
import { menu } from './menu';
import { offer } from './offer';
import { restaurantDishType } from './restaurant-dish-type';
import { restaurantSetting } from './restaurant-setting';
import { schedules } from './schedule';
import { snapshot } from './snapshot';
import { socialMediaAccount } from './social';
import { userRestaurant } from './user-restaurant';

export const restaurant = pgTable(
  'restaurant',
  {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    phoneNumber: varchar('phone_number').notNull(),
    address: varchar('address').notNull(),
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
  holidays: many(holiday),
  addOns: many(addOn),
  settings: one(restaurantSetting),
  schedules: many(schedules),
  socialAccounts: many(socialMediaAccount),
  snapshots: many(snapshot),
  businessHours: many(businessHours),
}));

export type RestaurantSelect = typeof restaurant.$inferSelect;
