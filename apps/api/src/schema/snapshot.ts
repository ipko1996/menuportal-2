import { relations } from 'drizzle-orm';
import {
  date,
  decimal,
  index,
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

import { entityTypeEnum } from '../constants';
import { dish } from './dish';
import { dishType } from './dish-type';
import { restaurant } from './restaurant';
import { postSnapshot } from './social';

export const snapshot = pgTable(
  'snapshot',
  {
    id: serial('id').primaryKey(),
    restaurantId: integer('restaurant_id')
      .notNull()
      .references(() => restaurant.id),
    entityType: entityTypeEnum('entity_type').notNull(),
    originalId: integer('original_id'),
    date: date('date', { mode: 'string' }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  t => [
    index('snapshot_restaurant_created_idx').on(t.restaurantId, t.createdAt),
    index('snapshot_restaurant_date_idx').on(t.restaurantId, t.date),
  ]
);

export const snapshotMenu = pgTable('snapshot_menu', {
  snapshotId: integer('snapshot_id')
    .notNull()
    .references(() => snapshot.id)
    .primaryKey(),
  originalMenuId: integer('original_menu_id'),
  menuName: varchar('menu_name').notNull(),
  price: decimal('price', { mode: 'number', precision: 5, scale: 0 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const snapshotOffer = pgTable('snapshot_offer', {
  snapshotId: integer('snapshot_id')
    .notNull()
    .references(() => snapshot.id)
    .primaryKey(),
  originalOfferId: integer('original_offer_id'),
  price: decimal('price', { mode: 'number', precision: 5, scale: 0 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const snapshotItem = pgTable(
  'snapshot_item',
  {
    id: serial('id').primaryKey(),
    snapshotId: integer('snapshot_id')
      .notNull()
      .references(() => snapshot.id),
    originalDishId: integer('original_dish_id').references(() => dish.id),
    dishName: varchar('dish_name').notNull(),
    dishTypeId: integer('dish_type_id')
      .notNull()
      .references(() => dishType.id),
    restaurantId: integer('restaurant_id')
      .notNull()
      .references(() => restaurant.id),
    position: integer('position'),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  t => [index('snapshot_item_snapshot_idx').on(t.snapshotId)]
);

export const snapshotRelations = relations(snapshot, ({ many }) => ({
  menus: many(snapshotMenu),
  offers: many(snapshotOffer),
  items: many(snapshotItem),
  postSnapshots: many(postSnapshot),
}));

export const snapshotMenuRelations = relations(snapshotMenu, ({ one }) => ({
  snapshot: one(snapshot, {
    fields: [snapshotMenu.snapshotId],
    references: [snapshot.id],
  }),
}));

export const snapshotOfferRelations = relations(snapshotOffer, ({ one }) => ({
  snapshot: one(snapshot, {
    fields: [snapshotOffer.snapshotId],
    references: [snapshot.id],
  }),
}));

export const snapshotItemRelations = relations(snapshotItem, ({ one }) => ({
  snapshot: one(snapshot, {
    fields: [snapshotItem.snapshotId],
    references: [snapshot.id],
  }),
  dish: one(dish, {
    fields: [snapshotItem.originalDishId],
    references: [dish.id],
  }),
  dishType: one(dishType, {
    fields: [snapshotItem.dishTypeId],
    references: [dishType.id],
  }),
  restaurant: one(restaurant, {
    fields: [snapshotItem.restaurantId],
    references: [restaurant.id],
  }),
}));
