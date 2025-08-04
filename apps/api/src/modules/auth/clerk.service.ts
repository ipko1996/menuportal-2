import {
  ClerkClient,
  createClerkClient,
  User,
  verifyToken,
} from '@clerk/fastify';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClerkService {
  private readonly logger = new Logger(ClerkService.name);

  private readonly authorizedParties: string[] = [];
  private readonly clerkClient: ClerkClient;
  private secretKey: string;

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.getOrThrow('CLERK_SECRET_KEY');
    this.authorizedParties = this.configService
      .get('CLERK_AUTHORIZED_PARTIES', '')
      .split(',');
    this.clerkClient = createClerkClient({
      secretKey: this.secretKey,
    });
  }

  async verifyClerkToken(token: string) {
    return await verifyToken(token, {
      secretKey: this.secretKey,
      authorizedParties: this.authorizedParties,
    });
  }

  async getUser(userId: string): Promise<User> {
    this.logger.debug(`Fetching user with ID: ${userId}`);
    return await this.clerkClient.users.getUser(userId);
  }
}
