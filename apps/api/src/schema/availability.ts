import {
  date,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  timestamp,
} from 'drizzle-orm/pg-core';

import { entityTypeEnum } from '../constants';

export const availability = pgTable(
  'availability',
  {
    id: serial('id'),
    date: date('date', {
      mode: 'string',
    }).notNull(),
    entityType: entityTypeEnum('entity_type').notNull(),
    entityId: integer('entity_id').notNull(),
    createdAt: timestamp('created_at', {
      mode: 'string',
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  table => [
    primaryKey({ columns: [table.entityType, table.entityId, table.date] }),
    index('availability_date_idx').on(table.date),
    index('availability_range_idx').on(table.entityType, table.entityId),
  ]
);

export type AvailabilitySelect = typeof availability.$inferSelect;
