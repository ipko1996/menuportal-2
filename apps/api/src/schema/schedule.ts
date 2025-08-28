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

import { restaurant } from './restaurant';
import { post, socialMediaAccount } from './social';

export const scheduleSettings = pgTable(
  'schedule_settings',
  {
    id: serial('id').primaryKey(),
    restaurantId: integer('restaurant_id')
      .notNull()
      .references(() => restaurant.id, { onDelete: 'cascade' }),
    socialMediaAccountId: integer('social_media_account_id')
      .notNull()
      .references(() => socialMediaAccount.id, { onDelete: 'cascade' }),

    cronExpression: text('cron_expression').notNull(),

    templateId: text('template_id'),
    templateUrl: text('template_url'),
    contentText: text('content_text'),

    scheduleName: text('schedule_name').notNull(),

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
    index('schedule_settings_restaurant_idx').on(table.restaurantId),
    index('schedule_settings_cron_idx').on(table.cronExpression),
    index('schedule_settings_active_idx').on(table.isActive),
    index('schedule_settings_restaurant_active_idx').on(
      table.restaurantId,
      table.isActive
    ),
    index('schedule_settings_job_processing_idx').on(
      table.isActive,
      table.cronExpression
    ),
    unique('unique_restaurant_social_account_schedule').on(
      table.restaurantId,
      table.socialMediaAccountId
    ),
  ]
);

export const scheduleSettingsRelations = relations(
  scheduleSettings,
  ({ one, many }) => ({
    restaurant: one(restaurant, {
      fields: [scheduleSettings.restaurantId],
      references: [restaurant.id],
    }),
    socialMediaAccount: one(socialMediaAccount, {
      fields: [scheduleSettings.socialMediaAccountId],
      references: [socialMediaAccount.id],
    }),
    posts: many(post),
  })
);
