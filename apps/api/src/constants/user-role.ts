import { pgEnum } from 'drizzle-orm/pg-core';

export const RoleValues = ['ADMIN', 'MANAGER', 'CUSTOMER'] as const;
export const RoleEnum = pgEnum('role', RoleValues);

export type Role = (typeof RoleEnum.enumValues)[number];
