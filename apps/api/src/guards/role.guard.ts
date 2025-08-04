import { User } from '@clerk/fastify';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { eq } from 'drizzle-orm';
import { FastifyRequest } from 'fastify';

import { AppUser } from '@/common/types/user.types';
import type { Role } from '@/constants/user-role';

import { ClerkService } from '../modules/auth/clerk.service';
import { restaurant, RestaurantSelect, user, userRestaurant } from '../schema';
import { DatabaseService } from '../shared/database/database.service';

const whitelist: Set<string> = new Set();

// Decorator to set required roles
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

// Decorator for public routes (no auth required)
export const Public = () => SetMetadata('isPublic', true);

@Injectable()
export class RoleAuthGuard implements CanActivate {
  private readonly logger = new Logger(RoleAuthGuard.name);

  constructor(
    private readonly clerkService: ClerkService,
    private readonly databaseService: DatabaseService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<
      FastifyRequest & {
        raw: {
          sub?: string;
        };
        user: User;
        appUser: AppUser;
      }
    >();

    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Check whitelist
    if (whitelist.has(request.url)) {
      return true;
    }

    const sub = request.raw.sub;

    if (!sub) {
      this.logger.warn('Missing sub in request');
      throw new UnauthorizedException('Unauthorized');
    }

    // Get user from Clerk
    const authedUser = await this.clerkService.getUser(sub);
    if (authedUser.banned) {
      this.logger.warn(`User ${authedUser.id} is banned`);
      throw new UnauthorizedException('Access denied');
    }

    this.logger.debug(`User ${authedUser.id} authenticated successfully`);

    // Get user from database
    const [userData] = await this.databaseService.db
      .select({
        id: user.id,
        externalId: user.externalId,
        role: user.role,
        restaurant: restaurant,
      })
      .from(user)
      .leftJoin(userRestaurant, eq(user.id, userRestaurant.userId))
      .leftJoin(restaurant, eq(userRestaurant.restaurantId, restaurant.id))
      .where(eq(user.externalId, authedUser.id))
      .limit(1);

    if (!userData) {
      this.logger.warn(
        `User with external ID ${authedUser.id} not found in database`
      );
      throw new UnauthorizedException('User not found');
    }

    // Attach user data to request for later use
    request.user = authedUser;
    request.appUser = {
      db: {
        id: userData.id,
        externalId: userData.externalId,
      },
      restaurant: userData.restaurant,
    };

    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access (authenticated users only)
    if (!requiredRoles || requiredRoles.length === 0) {
      this.logger.debug(
        `No roles required for ${request.url}, allowing access`
      );
      return true;
    }

    // Check if user has at least one of the required roles
    const userRole = userData.role;
    const hasRequiredRole = requiredRoles.includes(userRole);

    if (!hasRequiredRole) {
      this.logger.warn(
        `User ${userData.id} with role ${userRole} attempted to access ${
          request.url
        } requiring roles: ${requiredRoles.join(', ')}`
      );
      throw new UnauthorizedException('Insufficient permissions');
    }

    this.logger.debug(
      `User ${userData.id} with role ${userRole} granted access to ${request.url}`
    );

    return true;
  }
}
