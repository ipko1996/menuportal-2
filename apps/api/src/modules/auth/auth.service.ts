import { Injectable, Logger } from '@nestjs/common';

import { AppUser } from '@/common/types/user.types';

import { DatabaseService } from '../../shared/database/database.service';
import { UserDto } from './dto/user.dto';

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

  // async addUser(userDto: User): Promise<UserDto> {
  //   const [existingUser] = await this.databaseService.db
  //     .select()
  //     .from(user)
  //     .where(eq(user.externalId, userDto.externalId));

  //   if (existingUser) {
  //     throw new ConflictException('User already exists');
  //   }

  //   this.logger.log(`Adding user ${userDto.id}`);

  //   const [newUser] = await this.databaseService.db
  //     .insert(user)
  //     .values({
  //       externalId: userDto.externalId,
  //     })
  //     .returning({ id: user.id, externalId: user.externalId });
  //   this.logger.log(`Added user ${newUser.id}`);
  //   return newUser;
  // }
}
