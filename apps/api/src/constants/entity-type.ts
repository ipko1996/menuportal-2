import { pgEnum } from 'drizzle-orm/pg-core';

export const entityTypeValues = ['MENU', 'OFFER'] as const;

export type EntityType = (typeof entityTypeValues)[number];

export const entityTypeEnum = pgEnum('entity_type', entityTypeValues);
