import { relations } from 'drizzle-orm';
import {
  index,
  integer,
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
    restaurantId: integer('restaurant_id')
      .notNull()
      .references(() => restaurant.id),
    menuName: varchar('menuName'),
    price: integer('price'),
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
  (table) => [
    index('menu_name_idx').on(table.menuName),
    index('menu_restaurant_id_idx').on(table.restaurantId),
  ]
);

export const menuRelations = relations(menu, ({ many, one }) => ({
  dishMenus: many(dishMenu),
  restaurant: one(restaurant),
}));

export type MenuSelect = typeof menu.$inferSelect;
