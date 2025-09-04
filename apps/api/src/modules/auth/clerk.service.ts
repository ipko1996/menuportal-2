import {
  ClerkClient,
  createClerkClient,
  User,
  verifyToken,
} from '@clerk/fastify';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { backOff } from 'exponential-backoff';

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

    return await backOff(
      async () => {
        try {
          return await this.clerkClient.users.getUser(userId);
        } catch (error) {
          this.logger.warn(
            `Failed to fetch user ${userId} — ${error?.message ?? error}`
          );
          throw error;
        }
      },
      {
        // Retry up to 5 times with exponential backoff
        numOfAttempts: 5,
        startingDelay: 200,
        timeMultiple: 2,
        maxDelay: 5000,
        retry: (error, attemptNumber) => {
          const transient =
            error?.clerkError &&
            error?.errors?.some((e: any) => e.code === 'unexpected_error');

          if (!transient) {
            this.logger.error(
              `Non-retryable error when fetching user ${userId}, attempt ${attemptNumber}`,
              error?.stack
            );
            return false;
          }

          this.logger.warn(
            `Retrying fetch user ${userId} (attempt ${attemptNumber})`
          );
          return true;
        },
      }
    );
  }
}
