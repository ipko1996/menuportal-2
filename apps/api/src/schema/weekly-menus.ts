import { relations } from 'drizzle-orm';
import { bigint, index, pgEnum, pgTable, unique } from 'drizzle-orm/pg-core';
import { smallint, timestamp, uuid } from 'drizzle-orm/pg-core';

import { dailyMenuItems } from './daily-menu-items';
import { restaurant } from './restaurant';

export const weeklyMenuStatusEnum = pgEnum('weekly_menu_status', [
  'DRAFT',
  'SCHEDULED',
  'PUBLISHED',
  'FAILED',
]);

export const weeklyMenus = pgTable(
  'weekly_menus',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    restaurantId: bigint('restaurant_id', { mode: 'number' })
      .notNull()
      .references(() => restaurant.id),
    year: smallint('year').notNull(),
    weekNumber: smallint('week_number').notNull(),
    status: weeklyMenuStatusEnum('status').notNull().default('DRAFT'),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string',
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique('weekly_menus_restaurant_year_week_unique').on(
      table.restaurantId,
      table.year,
      table.weekNumber
    ),
    index('idx_weekly_menus_restaurant_id').on(table.restaurantId),
    index('idx_weekly_menus_year_week').on(table.year, table.weekNumber),
  ]
);

export const weeklyMenusRelations = relations(weeklyMenus, ({ many, one }) => ({
  dailyMenuItems: many(dailyMenuItems),
  restaurant: one(restaurant, {
    fields: [weeklyMenus.restaurantId],
    references: [restaurant.id],
  }),
}));
