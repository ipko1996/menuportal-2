import { relations } from 'drizzle-orm';
import {
  decimal,
  index,
  integer,
  pgTable,
  serial,
  timestamp,
} from 'drizzle-orm/pg-core';

import { dish } from './dish';
import { offerAddOn } from './offer-add-on';
import { restaurant } from './restaurant';

export const offer = pgTable(
  'offer',
  {
    id: serial('id').primaryKey(),
    restaurantId: integer('restaurant_id')
      .notNull()
      .references(() => restaurant.id),
    dishId: integer('dish_id')
      .references(() => dish.id)
      .notNull(),
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
  table => [index('offer_dish_id_idx').on(table.dishId)]
);

export const offerRelations = relations(offer, ({ one, many }) => ({
  dish: one(dish),
  restaurant: one(restaurant),
  offerAddOns: many(offerAddOn),
}));

export type OfferSelect = typeof offer.$inferSelect;
