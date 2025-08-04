import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ClerkService } from '../modules/auth/clerk.service';

interface ClerkRequest extends FastifyRequest {
  sub?: string | null;
}

@Injectable()
export class ClerkMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ClerkMiddleware.name);

  constructor(private readonly clerkService: ClerkService) {}

  async use(
    req: ClerkRequest,
    _res: FastifyReply,
    next: () => void
  ): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      this.logger.debug('No authorization header found');
      return next();
    }

    const token = authHeader.split(' ')[1]?.trim();

    if (!token) {
      this.logger.debug('No bearer token found');
      return next();
    }

    try {
      const authedRequest = await this.clerkService.verifyClerkToken(token);
      req.sub = authedRequest.sub;
      this.logger.debug(`Token verified for user: ${req.sub}`);
    } catch (error) {
      this.logger.warn('Token verification failed', error);
      // Don't throw here - let the guard handle auth failures
      // This allows for better error handling and public routes
    }

    next();
  }
}
