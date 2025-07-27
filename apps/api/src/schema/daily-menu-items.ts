import { relations } from 'drizzle-orm';
import {
  date,
  index,
  numeric,
  pgTable,
  smallint,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { entityTypeEnum } from '../constants';
import { weeklyMenus } from './weekly-menus';

export const dailyMenuItems = pgTable(
  'daily_menu_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    weeklyMenuId: uuid('weekly_menu_id')
      .notNull()
      .references(() => weeklyMenus.id, { onDelete: 'cascade' }),
    date: date('date', {
      mode: 'string',
    }).notNull(),
    displayGroupId: uuid('display_group_id').notNull(),
    entityType: entityTypeEnum('entity_type').notNull(),
    groupName: varchar('group_name', { length: 255 }),
    groupPrice: numeric('group_price', { precision: 10, scale: 2 }),
    itemName: varchar('item_name', { length: 255 }).notNull(),
    itemPosition: smallint('item_position').notNull().default(0),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string',
    })
      .notNull()
      .defaultNow(),
  },
  table => [index('idx_dmi_weekly_menu_id').on(table.weeklyMenuId)]
);

export const dailyMenuItemsRelations = relations(dailyMenuItems, ({ one }) => ({
  weeklyMenu: one(weeklyMenus, {
    fields: [dailyMenuItems.weeklyMenuId],
    references: [weeklyMenus.id],
  }),
}));
