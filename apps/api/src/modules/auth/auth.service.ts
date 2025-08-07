import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { RestaurantSelect, UserSelect } from '@/schema';
import { DatabaseService } from '@/shared/database/database.service';
import { AppUser } from '@/shared/types';

import { UserDto, UserDtoWithRestaurant } from './dto/user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private readonly databaseService: DatabaseService) {}

  getUser(user: AppUser): UserDto {
    return {
      id: user.db.id,
      externalId: user.db.externalId,
    };
  }

  async getUserWithRestaurant(
    user: AppUser<'MANAGER' | 'ADMIN'>
  ): Promise<UserDtoWithRestaurant> {
    this.logger.log(`Getting user with restaurant for user ${user.db.id}`);

    return {
      id: user.db.id,
      externalId: user.db.externalId,
      restaurant: user.restaurant,
    };
  }
}
