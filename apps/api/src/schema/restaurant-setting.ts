import { relations } from 'drizzle-orm';
import {
  decimal,
  index,
  integer,
  pgTable,
  serial,
  unique,
} from 'drizzle-orm/pg-core';

import { restaurant } from './restaurant';

export const restaurantSetting = pgTable(
  'restaurant_setting',
  {
    id: serial('id').primaryKey(),
    restaurantId: integer('restaurant_id')
      .notNull()
      .references(() => restaurant.id, { onDelete: 'cascade' }),
    menuPrice: decimal('menu_price', {
      mode: 'number',
      precision: 5,
      scale: 0,
    }),
    takeawayPrice: decimal('takeaway_price', {
      mode: 'number',
      precision: 5,
      scale: 0,
    }),
  },
  table => [
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
