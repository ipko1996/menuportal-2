import { pgEnum } from 'drizzle-orm/pg-core';

export const scheduleTypeValues = ['WEEKLY', 'DAILY'] as const;

export type ScheduleType = (typeof scheduleTypeValues)[number];

export const ScheduleTypeEnum = pgEnum('schedule_type', scheduleTypeValues);
