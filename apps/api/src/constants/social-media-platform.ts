import { pgEnum } from 'drizzle-orm/pg-core';

export const socialMediaPlatformValues = [
  'FACEBOOK',
  'INSTAGRAM',
  'TWITTER',
] as const;

export type SocialMediaPlatform = (typeof socialMediaPlatformValues)[number];

export const SocialMediaPlatformEnum = pgEnum(
  'social_media_platform',
  socialMediaPlatformValues
);
