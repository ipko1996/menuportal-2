import { relations } from 'drizzle-orm';
import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

import { restaurant } from './restaurant';

export const holiday = pgTable('holiday', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  restaurantId: serial('restaurant_id')
    .notNull()
    .references(() => restaurant.id),
});

export const holidayRelations = relations(holiday, ({ one }) => ({
  restaurant: one(restaurant, {
    fields: [holiday.restaurantId],
    references: [restaurant.id],
  }),
}));
