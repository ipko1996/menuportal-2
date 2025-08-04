import { relations } from 'drizzle-orm';
import {
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { RoleEnum } from '../constants/user-role';
import { restaurant } from './restaurant';

export const user = pgTable(
  'user',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    externalId: varchar('external_user_id', { length: 255 }).notNull(),
    role: RoleEnum('role').notNull().default('CUSTOMER'),
    createdAt: timestamp('created_at', {
      mode: 'string',
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  table => [uniqueIndex('user_external_id_idx').on(table.externalId)]
);

export const userRelations = relations(user, ({ one }) => ({
  restaurant: one(restaurant),
}));

export type UserSelect = typeof user.$inferSelect;
