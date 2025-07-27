import {
  bigint,
  date,
  index,
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
    entityId: bigint('entity_id', { mode: 'number' }).notNull(),
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
  table => [
    primaryKey({ columns: [table.entityType, table.entityId, table.date] }),
    index('availability_date_idx').on(table.date),
    index('availability_range_idx').on(table.entityType, table.entityId),
  ]
);

export type AvailabilitySelect = typeof availability.$inferSelect;
