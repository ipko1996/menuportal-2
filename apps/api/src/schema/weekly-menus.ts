import { relations } from 'drizzle-orm';
import { index, integer, pgTable, unique } from 'drizzle-orm/pg-core';
import { smallint, timestamp, uuid } from 'drizzle-orm/pg-core';

import { MenuStatusEnum } from '../constants/menu-status';
import { dailyMenuItems } from './daily-menu-items';
import { restaurant } from './restaurant';

export const weeklyMenus = pgTable(
  'weekly_menus',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    restaurantId: integer('restaurant_id')
      .notNull()
      .references(() => restaurant.id),
    year: smallint('year').notNull(),
    weekNumber: smallint('week_number').notNull(),
    status: MenuStatusEnum('status').notNull().default('DRAFT'),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    })
      .notNull()
      .defaultNow(),
  },
  table => [
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
