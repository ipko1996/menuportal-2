import { relations } from 'drizzle-orm';
import {
  decimal,
  index,
  integer,
  pgTable,
  serial,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';

import { offerAddOn } from './offer-add-on';
import { restaurant } from './restaurant';

export const addOn = pgTable(
  'add_on',
  {
    id: serial('id').primaryKey(),
    addOnName: varchar('name', { length: 255 }).notNull(),
    price: decimal('price', {
      mode: 'number',
      precision: 5,
      scale: 0,
    }).notNull(),
    restaurantId: integer('restaurant_id')
      .notNull()
      .references(() => restaurant.id),
  },
  table => [
    index('add_on_name_idx').on(table.addOnName),
    unique('add_on_restaurant_name_idx').on(
      table.addOnName,
      table.restaurantId
    ),
  ]
);

export const addOnRelations = relations(addOn, ({ many, one }) => ({
  offerAddOns: many(offerAddOn),
  restaurant: one(restaurant),
}));

export type AddOnSelect = typeof addOn.$inferSelect;
