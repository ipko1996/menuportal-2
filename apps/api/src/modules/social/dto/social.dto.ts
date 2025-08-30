import { SocialMediaPlatform } from '@/constants';

export class SocialDto {
  id: number;
  platform: SocialMediaPlatform;
  isActive: boolean;
  tokenExpiresAt: string | null;
}
