import { pgEnum } from 'drizzle-orm/pg-core';

export const MenuStatusValues = [
  'DRAFT',
  'SCHEDULED',
  'PUBLISHED',
  'FAILED',
] as const;

export type MenuStatus = (typeof MenuStatusValues)[number];

export const MenuStatusEnum = pgEnum('menu_status', MenuStatusValues);
