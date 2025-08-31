import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { socialMediaAccount } from '@/schema';
import { DatabaseService } from '@/shared/database/database.service';

import { SocialDto } from './dto/social.dto';

@Injectable()
export class SocialService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAllSocaialsForRestaurant(
    restaurantId: number
  ): Promise<SocialDto[]> {
    return await this.databaseService.db
      .select({
        id: socialMediaAccount.id,
        platform: socialMediaAccount.platform,
        isActive: socialMediaAccount.isActive,
        tokenExpiresAt: socialMediaAccount.tokenExpiresAt,
      })
      .from(socialMediaAccount)
      .where(eq(socialMediaAccount.restaurantId, restaurantId));
  }
}
