import { relations } from 'drizzle-orm';
import {
  bigint,
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
    dishId: bigint('dish_id', { mode: 'number' }).references(() => dish.id),
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
  (table) => [index('offer_dish_id_idx').on(table.dishId)]
);

export const offerRelations = relations(offer, ({ one, many }) => ({
  dish: one(dish),
  restaurant: one(restaurant),
  offerAddOns: many(offerAddOn),
}));

export type OfferSelect = typeof offer.$inferSelect;
