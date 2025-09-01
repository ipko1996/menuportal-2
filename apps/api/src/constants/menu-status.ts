import { pgEnum } from 'drizzle-orm/pg-core';

export const MenuStatusValues = [
  'SCHEDULED',
  'PUBLISHED',
  'FAILED',
  'PUBLISHING',
] as const;

export const MenuStatusApiValues = [
  'DRAFT',
  'PARTIALLY_FAILED',
  ...MenuStatusValues,
] as const;

export type MenuStatus = (typeof MenuStatusValues)[number];
export type MenuStatusApi = (typeof MenuStatusApiValues)[number];

export const MenuStatusEnum = pgEnum('menu_status', MenuStatusValues);
