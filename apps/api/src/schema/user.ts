import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

import { restaurant } from './restaurant';

export const user = pgTable(
  'user',
  {
    id: serial('id').primaryKey(),
    externalId: varchar('external_user_id', { length: 255 }).notNull(),
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
  (table) => [uniqueIndex('user_external_id_idx').on(table.externalId)]
);

export const userRelations = relations(user, ({ one }) => ({
  ownedRestaurant: one(restaurant),
}));

export type UserSelect = typeof user.$inferSelect;
