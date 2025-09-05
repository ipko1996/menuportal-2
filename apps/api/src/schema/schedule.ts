import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

import { ScheduleTypeEnum } from '../constants/schedule-type';
import { restaurant } from './restaurant';
import { socialMediaAccount } from './social';

// --- 1. The Core `schedules` Table ---
// This table holds the "what" and "when" of a scheduling campaign.
// It contains all the shared information and optional default content.

export const schedules = pgTable(
  'schedules',
  {
    id: serial('id').primaryKey(),
    restaurantId: integer('restaurant_id')
      .notNull()
      .references(() => restaurant.id, { onDelete: 'cascade' }),

    // The type for grouping and querying, e.g., 'weekly', 'daily'
    scheduleType: ScheduleTypeEnum('schedule_type').notNull(),

    // Shared timing for all platforms in this schedule
    cronExpression: text('cron_expression').notNull(),

    // Optional: A fallback image URL if a platform-specific one isn't set
    defaultTemplateId: text('default_template_id'),
    // Optional: Fallback text content
    defaultContentText: text('default_content_text'),

    // A master switch to activate or deactivate the entire campaign
    isActive: boolean('is_active').default(true).notNull(),

    createdAt: timestamp('created_at', {
      mode: 'string',
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', {
      mode: 'string',
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  table => [
    // Index for common queries
    index('schedules_restaurant_idx').on(table.restaurantId),
    index('schedules_type_idx').on(table.scheduleType),
    // A restaurant should not have two schedules with the same name.
    unique('unique_restaurant_schedule_type').on(
      table.restaurantId,
      table.scheduleType
    ),
  ]
);

// --- 2. The `platformSchedules` Table ---
// This table links a core `schedule` to the "where" – the specific social media accounts.
// It can override the default content from the parent `schedules` table.

export const platformSchedules = pgTable(
  'platform_schedules',
  {
    id: serial('id').primaryKey(),
    // Foreign key linking to the parent schedule
    scheduleId: integer('schedule_id')
      .notNull()
      .references(() => schedules.id, { onDelete: 'cascade' }),

    // Foreign key linking to the specific social media account
    socialMediaAccountId: integer('social_media_account_id')
      .notNull()
      .references(() => socialMediaAccount.id, { onDelete: 'no action' }),

    // Platform-specific override for the image. If NULL, use the default.
    templateId: text('template_id'),
    // Platform-specific override for the text. If NULL, use the default.
    contentText: text('content_text'),

    // Activates/deactivates posting to this specific platform for this schedule
    isActive: boolean('is_active').default(true).notNull(),

    createdAt: timestamp('created_at', {
      mode: 'string',
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', {
      mode: 'string',
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  table => [
    // A schedule can only be linked to a social account once
    unique('unique_schedule_social_account').on(
      table.scheduleId,
      table.socialMediaAccountId
    ),
    index('platform_schedules_schedule_idx').on(table.scheduleId),
    index('platform_schedules_account_idx').on(table.socialMediaAccountId),
  ]
);

// --- 3. Drizzle Relations ---

export const schedulesRelations = relations(schedules, ({ one, many }) => ({
  // Each schedule belongs to one restaurant
  restaurant: one(restaurant, {
    fields: [schedules.restaurantId],
    references: [restaurant.id],
  }),
  // Each schedule can be linked to many platform-specific settings
  platformSchedules: many(platformSchedules),
}));

export const platformSchedulesRelations = relations(
  platformSchedules,
  ({ one }) => ({
    // Each platform-specific setting belongs to one core schedule
    schedule: one(schedules, {
      fields: [platformSchedules.scheduleId],
      references: [schedules.id],
    }),
    // Each platform-specific setting belongs to one social media account
    socialMediaAccount: one(socialMediaAccount, {
      fields: [platformSchedules.socialMediaAccountId],
      references: [socialMediaAccount.id],
    }),
  })
);
