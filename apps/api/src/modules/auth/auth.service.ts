import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { firstValueFrom } from 'rxjs';

import {
  restaurant as restaurantSchema,
  socialMediaAccount,
  SocialMediaPlatform,
  user as userSchema,
  userRestaurant,
} from '@/schema';
import { DatabaseService } from '@/shared/database/database.service';
import { EncryptionService } from '@/shared/services/encryption.service';
import type { AppUser } from '@/shared/types';

import { ClerkService } from './clerk.service';
import { SocialAccountDto } from './dto/social-account.dto';
import { UserDto, UserDtoWithRestaurant } from './dto/user.dto';

interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
}

interface FacebookUserResponse {
  id: string;
  name: string;
}

interface FacebookPageResponse {
  id: string;
  name: string;
  access_token: string;
  category: string;
}

interface FacebookPagesResponse {
  data: FacebookPageResponse[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly FACEBOOK_API_VERSION = 'v23.0';

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly clerkService: ClerkService,
    private readonly encryptionService: EncryptionService
  ) {}

  // Helper to get frontend URL from config for the controller
  getFrontendUrl(): string {
    return this.configService.get<string>(
      'MENUPORTAL_FRONTEND_URL',
      'http://localhost:4200'
    );
  }

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

  /**
   * Fetches the connected social media accounts for the user's restaurant.
   */
  async getSocialAccounts(
    user: AppUser<'MANAGER' | 'ADMIN'>
  ): Promise<SocialAccountDto[]> {
    this.logger.log(`Getting social accounts for user ${user.db.id}`);

    const restaurantId = user.restaurant.id;
    try {
      const accounts = await this.databaseService.db
        .select({
          platform: socialMediaAccount.platform,
          isActive: socialMediaAccount.isActive,
          accountName: socialMediaAccount.accountName,
        })
        .from(socialMediaAccount)
        .where(eq(socialMediaAccount.restaurantId, restaurantId));

      this.logger.log(
        `Found ${accounts.length} social accounts for restaurant ${restaurantId}`
      );
      return accounts;
    } catch (error) {
      this.logger.error(
        `Failed to fetch social media accounts for restaurant ${restaurantId}`,
        error.stack
      );
      throw new InternalServerErrorException(
        'Could not fetch social media accounts.'
      );
    }
  }

  async handleFacebookCallback(
    code: string,
    state: string
  ): Promise<SocialMediaPlatform> {
    const clerkToken = state;
    const { id, restaurant } = await this.getUserFromClerkToken(clerkToken);

    if (!restaurant) {
      this.logger.warn(`No restaurant found for user ${id}`);
      throw new UnauthorizedException(
        'User is not associated with any restaurant.'
      );
    }

    this.logger.log(
      `Handling Facebook callback for user ${id} at restaurant ID: ${restaurant.id}`
    );

    // Step 1: Exchange code for user access token
    const { accessToken: userAccessToken } = await this.exchangeCodeForToken(
      code
    );

    // // Step 2: Get user details
    // const facebookUser = await this.getFacebookUserDetails(userAccessToken);

    // Step 3: Get page access tokens
    const pages = await this.getFacebookPages(userAccessToken);

    if (pages.length === 0) {
      throw new BadRequestException(
        'No Facebook pages found for this account. You need to manage at least one Facebook page to connect.'
      );
    }

    if (pages.length > 1) {
      this.logger.error(
        `Multiple Facebook pages found for user ${id}: ${pages
          .map(p => p.name)
          .join(', ')}`
      );
      throw new BadRequestException(
        'Multiple Facebook pages found. Please ensure you manage only one page for now.'
      );
    }

    // For now, we'll use the first page. You might want to let users choose which page to connect
    const selectedPage = pages[0];

    this.logger.log(
      `Selected Facebook page: ${selectedPage.name} (ID: ${selectedPage.id})`
    );

    // Use the page access token instead of user access token
    const pageAccessToken = selectedPage.access_token;
    const encryptedAccessToken =
      this.encryptionService.encrypt(pageAccessToken);

    const platform = 'FACEBOOK' as const;

    const valuesToInsert = {
      restaurantId: restaurant.id,
      platform,
      accountName: selectedPage.name,
      platformAccountId: selectedPage.id, // Use page ID, not user ID
      accessToken: encryptedAccessToken,
      tokenExpiresAt: undefined,
      isActive: true,
    };

    try {
      await this.databaseService.db
        .insert(socialMediaAccount)
        .values(valuesToInsert)
        .onConflictDoUpdate({
          target: [
            socialMediaAccount.restaurantId,
            socialMediaAccount.platform,
          ],
          set: {
            accessToken: valuesToInsert.accessToken,
            accountName: valuesToInsert.accountName,
            tokenExpiresAt: valuesToInsert.tokenExpiresAt,
            platformAccountId: valuesToInsert.platformAccountId,
            isActive: true,
            updatedAt: new Date().toISOString(),
          },
        });

      this.logger.log(
        `Successfully saved Facebook page account ${selectedPage.name} for restaurant ${restaurant.id}`
      );
      return platform;
    } catch (error) {
      this.logger.error('Failed to save social media account', error.stack);
      throw new InternalServerErrorException(
        'Could not save Facebook account information.'
      );
    }
  }

  async handleCallback(
    platform: SocialMediaPlatform,
    code: string,
    state: string
  ) {
    switch (platform) {
      case 'FACEBOOK':
        return this.handleFacebookCallback(code, state);
      case 'INSTAGRAM':
        throw new NotImplementedException(
          'Instagram integration not yet implemented'
        );
      default:
        throw new BadRequestException('Unsupported social platform');
    }
  }

  /**
   * Verifies a Clerk token and fetches the associated user and restaurant from the DB.
   * @param token The JWT token from Clerk.
   */
  private async getUserFromClerkToken(token: string) {
    if (!token) {
      throw new UnauthorizedException('Missing authentication token.');
    }
    try {
      const authedRequest = await this.clerkService.verifyClerkToken(token);
      const authedUser = await this.clerkService.getUser(authedRequest.sub);

      if (!authedUser) {
        throw new UnauthorizedException('Invalid token payload: missing sub.');
      }

      const [userData] = await this.databaseService.db
        .select({
          id: userSchema.id,
          externalId: userSchema.externalId,
          role: userSchema.role,
          restaurant: restaurantSchema,
        })
        .from(userSchema)
        .leftJoin(userRestaurant, eq(userSchema.id, userRestaurant.userId))
        .leftJoin(
          restaurantSchema,
          eq(userRestaurant.restaurantId, restaurantSchema.id)
        )
        .where(eq(userSchema.externalId, authedUser.id))
        .limit(1);

      if (!userData || !userData.restaurant) {
        throw new UnauthorizedException(
          'User or associated restaurant not found.'
        );
      }

      return userData;
    } catch (error) {
      this.logger.warn('Token verification failed in AuthService', error);
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }

  /**
   * Exchanges the authorization code for a short-lived user access token.
   */
  private async exchangeCodeForToken(
    code: string
  ): Promise<{ accessToken: string }> {
    const appId = this.configService.get<string>('FB_APP_ID');
    const appSecret = this.configService.get<string>('FB_APP_SECRET');
    const redirectUri = this.configService.get<string>('FB_CALLBACK_URL');

    const url = `https://graph.facebook.com/${this.FACEBOOK_API_VERSION}/oauth/access_token`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<FacebookTokenResponse>(url, {
          params: {
            client_id: appId,
            client_secret: appSecret,
            redirect_uri: redirectUri,
            code,
          },
        })
      );

      return {
        accessToken: response.data.access_token,
      };
    } catch (error) {
      this.logger.error(
        'Failed to exchange Facebook code for token',
        error.response?.data
      );
      throw new InternalServerErrorException(
        'Authentication with Facebook failed.'
      );
    }
  }

  /**
   * Fetches the user's basic profile information (ID and name) from Facebook.
   */
  // private async getFacebookUserDetails(
  //   accessToken: string
  // ): Promise<FacebookUserResponse> {
  //   const url = `https://graph.facebook.com/${this.FACEBOOK_API_VERSION}/me`;
  //   try {
  //     const response = await firstValueFrom(
  //       this.httpService.get<FacebookUserResponse>(url, {
  //         params: {
  //           fields: 'id,name',
  //           access_token: accessToken,
  //         },
  //       })
  //     );
  //     return response.data;
  //   } catch (error) {
  //     this.logger.error(
  //       'Failed to get user details from Facebook',
  //       error.response?.data
  //     );
  //     throw new InternalServerErrorException(
  //       'Could not fetch user details from Facebook.'
  //     );
  //   }
  // }

  /**
   * Fetches the Facebook pages that the user manages, along with their page access tokens.
   */
  private async getFacebookPages(
    userAccessToken: string
  ): Promise<FacebookPageResponse[]> {
    const url = `https://graph.facebook.com/${this.FACEBOOK_API_VERSION}/me/accounts`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<FacebookPagesResponse>(url, {
          params: {
            access_token: userAccessToken,
            fields: 'id,name,access_token,category',
          },
        })
      );

      this.logger.log(
        `Found ${response.data.data.length} Facebook pages for user`
      );
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get Facebook pages', error.response?.data);
      throw new InternalServerErrorException('Could not fetch Facebook pages.');
    }
  }
}
