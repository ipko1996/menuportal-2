import { pgEnum } from 'drizzle-orm/pg-core';

export const dayNames = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

export type DayName = (typeof dayNames)[number];
export const DayNameEnum = pgEnum('day_name', dayNames);
