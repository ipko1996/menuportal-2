import { relations } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  pgTable,
  serial,
  unique,
} from 'drizzle-orm/pg-core';

import { restaurant } from './restaurant';

export const restaurantSetting = pgTable(
  'restaurant_setting',
  {
    id: serial('id').primaryKey(),
    restaurantId: bigint('restaurant_id', { mode: 'number' })
      .notNull()
      .references(() => restaurant.id),
    enableTakeaway: boolean('enable_takeaway').default(true).notNull(),
  },
  (table) => [
    index('restaurant_setting_restaurant_id_idx').on(table.restaurantId),
    unique('restaurant_id_unique').on(table.restaurantId),
  ]
);

export const restaurantSettingRelations = relations(
  restaurantSetting,
  ({ one }) => ({
    restaurant: one(restaurant),
  })
);
