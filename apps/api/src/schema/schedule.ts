import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  time,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

import { DayNameEnum } from '../constants';
import { restaurant } from './restaurant';
import { socialMediaAccount } from './social';

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

    // postTime: text('post_time').notNull(),
    // postDay: DayNameEnum('post_day').notNull(),
    cronExpression: text('cron_expression').notNull(), // e.g., "0 9 * * MON" for every Monday at 09:00 AM

    templateId: integer('template_id'),
    templateUrl: text('template_url'),
    contentText: text('content_text'),

    scheduleName: text('schedule_name').notNull(), // e.g., facebook-monday-0900 or trigger.dev's naming convention

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
      table.socialMediaAccountId,
      table.cronExpression
    ),
  ]
);

// export const scheduleSettingsSocialAccount = pgTable(
//   'schedule_settings_social_account',
//   {
//     scheduleSettingsId: integer('schedule_settings_id')
//       .notNull()
//       .references(() => scheduleSettings.id, { onDelete: 'cascade' }),
//     socialMediaAccountId: integer('social_media_account_id')
//       .notNull()
//       .references(() => socialMediaAccount.id, { onDelete: 'cascade' }),
//   },
//   table => [
//     unique('unique_schedule_social_account').on(
//       table.scheduleSettingsId,
//       table.socialMediaAccountId
//     ),
//     index('schedule_social_account_schedule_idx').on(table.scheduleSettingsId),
//     index('schedule_social_account_social_idx').on(table.socialMediaAccountId),
//   ]
// );

export const scheduleSettingsRelations = relations(
  scheduleSettings,
  ({ one }) => ({
    socialAccount: one(socialMediaAccount),
  })
);

// export const scheduleSettingsSocialAccountRelations = relations(
//   scheduleSettingsSocialAccount,
//   ({ one }) => ({
//     scheduleSettings: one(scheduleSettings, {
//       fields: [scheduleSettingsSocialAccount.scheduleSettingsId],
//       references: [scheduleSettings.id],
//     }),
//     socialMediaAccount: one(socialMediaAccount, {
//       fields: [scheduleSettingsSocialAccount.socialMediaAccountId],
//       references: [socialMediaAccount.id],
//     }),
//   })
// );

export const scheduleSettingsToRestaurantRelations = relations(
  scheduleSettings,
  ({ one }) => ({
    restaurant: one(restaurant, {
      fields: [scheduleSettings.restaurantId],
      references: [restaurant.id],
    }),
  })
);
