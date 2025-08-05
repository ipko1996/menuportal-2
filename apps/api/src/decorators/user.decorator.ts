import { User } from '@clerk/fastify';
import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

import { AppUser } from '@/shared/types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AppUser => {
    const request = ctx.switchToHttp().getRequest<
      FastifyRequest & {
        raw: {
          sub?: string;
        };
        user: User;
        appUser: AppUser;
      }
    >();

    if (!request.user) {
      Logger.log('User missing, did you forget to use the RoleAuthGuard?');
    }

    return request.appUser;
  }
);
