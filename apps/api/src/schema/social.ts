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

import {
  FailureReasonEnum,
  MenuStatusEnum,
  SocialMediaPlatformEnum,
} from '../constants';
import { restaurant } from './restaurant';
import { scheduleSettings } from './schedule';
// import { scheduleSettingsSocialAccount } from './schedule';
import { snapshot } from './snapshot';

export const socialMediaAccount = pgTable(
  'social_account',
  {
    id: serial('id').primaryKey(),
    restaurantId: integer('restaurant_id')
      .notNull()
      .references(() => restaurant.id, { onDelete: 'cascade' }),
    platform: SocialMediaPlatformEnum('platform').notNull(),

    // The specific ID or handle for the platform's API, e.g., Facebook Page ID
    platformAccountId: text('platform_account_id').notNull(),

    // IMPORTANT: Tokens should be encrypted
    accessToken: text('access_token').notNull(),
    refreshToken: text('refresh_token'),
    tokenExpiresAt: timestamp('token_expires_at', {
      mode: 'string',
      withTimezone: true,
    }),

    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', {
      mode: 'string',
      withTimezone: true,
    }).defaultNow(),
  },
  t => [
    index('unique_restaurant_platform_account_idx').on(
      t.restaurantId,
      t.platform,
      t.platformAccountId
    ),
  ]
);

export const post = pgTable(
  'post',
  {
    id: serial('id').primaryKey(),
    restaurantSocialAccountId: integer('restaurant_social_account_id')
      .notNull()
      .references(() => socialMediaAccount.id, { onDelete: 'cascade' }),

    status: MenuStatusEnum('status').default('SCHEDULED').notNull(),

    content: text('content'),

    scheduledAt: timestamp('scheduled_at', {
      mode: 'string',
      withTimezone: true,
    }).notNull(),
    postedAt: timestamp('posted_at', { mode: 'string', withTimezone: true }),
    postUrl: text('post_url'),

    generatedImageUrl: text('generated_image_url'),
    generatedPdfUrl: text('generated_pdf_url'),

    failureReason: FailureReasonEnum('failure_reason'),
    failureReasonDetails: text('failure_reason_details'),
    retryCount: integer('retry_count').default(0).notNull(),

    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  t => [index('post_status_scheduled_idx').on(t.status, t.scheduledAt)]
);

export const postSnapshot = pgTable(
  'post_snapshot',
  {
    id: serial('id').primaryKey(),
    postId: integer('post_id')
      .notNull()
      .references(() => post.id, { onDelete: 'cascade' }),
    snapshotId: integer('snapshot_id')
      .notNull()
      .references(() => snapshot.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', {
      mode: 'string',
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  table => [
    unique('unique_post_snapshot').on(table.postId, table.snapshotId),
    index('post_snapshot_post_idx').on(table.postId),
    index('post_snapshot_snapshot_idx').on(table.snapshotId),
  ]
);

export const socialMediaAccountRelations = relations(
  socialMediaAccount,
  ({ many, one }) => ({
    posts: many(post),
    scheduleSettingsSocialAccount: one(scheduleSettings),
  })
);

export const postRelations = relations(post, ({ one, many }) => ({
  socialMediaAccount: one(socialMediaAccount, {
    fields: [post.restaurantSocialAccountId],
    references: [socialMediaAccount.id],
  }),
  postSnapshots: many(postSnapshot),
}));

export const postSnapshotRelations = relations(postSnapshot, ({ one }) => ({
  post: one(post, {
    fields: [postSnapshot.postId],
    references: [post.id],
  }),
  snapshot: one(snapshot, {
    fields: [postSnapshot.snapshotId],
    references: [snapshot.id],
  }),
}));
