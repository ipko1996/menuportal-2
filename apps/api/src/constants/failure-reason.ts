import { pgEnum } from 'drizzle-orm/pg-core';

export const filureReasonValues = [
  'API_ERROR',
  'AUTHENTICATION_FAILED',
  'RATE_LIMIT_EXCEEDED',
  'INVALID_CONTENT',
  'NETWORK_ERROR',
  'PLATFORM_UNAVAILABLE',
  'INSUFFICIENT_PERMISSIONS',
  'CONTENT_POLICY_VIOLATION',
  'OTHER',
  'UNKNOWN_ERROR',
] as const;

export type FailureReason = (typeof filureReasonValues)[number];

export const FailureReasonEnum = pgEnum('failure_reason', filureReasonValues);
