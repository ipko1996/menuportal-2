import { relations } from 'drizzle-orm';
import { index, integer, pgTable, serial, time } from 'drizzle-orm/pg-core';

import { DayNameEnum } from '../constants/day-names';
import { restaurant } from './restaurant';

export const businessHours = pgTable(
  'business_hours',
  {
    id: serial('id').primaryKey(),
    dayOfWeek: DayNameEnum('day_of_week').notNull(),
    openingTime: time('opening_time').notNull(),
    closingTime: time('closing_time').notNull(),
    restaurantId: integer('restaurant_id')
      .notNull()
      .references(() => restaurant.id, { onDelete: 'cascade' }),
  },
  table => [index('business_hours_restaurant_id_idx').on(table.restaurantId)]
);

export const businessHoursRelations = relations(businessHours, ({ one }) => ({
  restaurant: one(restaurant, {
    fields: [businessHours.restaurantId],
    references: [restaurant.id],
  }),
}));
