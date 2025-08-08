import { relations } from 'drizzle-orm';
import {
  decimal,
  index,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

import { dishMenu } from './dish-menu';
import { restaurant } from './restaurant';

export const menu = pgTable(
  'menu',
  {
    id: serial('id').primaryKey(),
    restaurantId: serial('restaurant_id')
      .notNull()
      .references(() => restaurant.id),
    menuName: varchar('menuName').notNull(),
    price: decimal('price', {
      mode: 'number',
      precision: 5,
      scale: 0,
    }).notNull(),
    createdAt: timestamp('created_at', {
      mode: 'string',
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  table => [
    index('menu_name_idx').on(table.menuName),
    index('menu_restaurant_id_idx').on(table.restaurantId),
  ]
);

export const menuRelations = relations(menu, ({ many, one }) => ({
  dishMenus: many(dishMenu),
  restaurant: one(restaurant),
}));

export type MenuSelect = typeof menu.$inferSelect;
