import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { SocialMediaPlatform } from '@/constants';
import { CurrentUser } from '@/decorators/user.decorator';
import { RoleAuthGuard, Roles } from '@/guards/role.guard';
import type { AppUser } from '@/shared/types';

import { AuthService } from './auth.service';
import { SocialAccountDto } from './dto/social-account.dto';
import { UserDto, UserDtoWithRestaurant } from './dto/user.dto';

@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(RoleAuthGuard)
  @Roles('CUSTOMER')
  @ApiOperation({
    summary: 'Get the current user',
    operationId: 'getCurrentUser',
  })
  @ApiOkResponse({ type: UserDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden: User is banned' })
  @Get()
  getUser(@CurrentUser() user: AppUser) {
    return this.authService.getUser(user);
  }

  @UseGuards(RoleAuthGuard)
  @Roles('MANAGER', 'ADMIN')
  @ApiOperation({
    summary: 'Get the current user with restaurant',
    operationId: 'getCurrentUserWithRestaurant',
  })
  @ApiOkResponse({ type: UserDtoWithRestaurant })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden: User is banned' })
  @Get('with-restaurant')
  getUserWithRestaurant(
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ): Promise<UserDtoWithRestaurant> {
    return this.authService.getUserWithRestaurant(user);
  }

  @UseGuards(RoleAuthGuard)
  @Roles('MANAGER', 'ADMIN')
  @ApiOperation({
    summary: "Get the user's connected social media accounts",
    operationId: 'getSocials',
  })
  @ApiOkResponse({
    description: 'A list of connected social media platforms.',
    type: [SocialAccountDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Get('socials')
  getSocials(
    @CurrentUser() user: AppUser<'MANAGER' | 'ADMIN'>
  ): Promise<SocialAccountDto[]> {
    return this.authService.getSocialAccounts(user);
  }

  @UseGuards(RoleAuthGuard)
  @Roles('MANAGER', 'ADMIN')
  @ApiOperation({
    summary: 'Callback for Facebook OAuth flow',
    operationId: 'facebookCallback',
  })
  @ApiOkResponse({ description: 'Successfully connected Facebook account' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized: Invalid token in state',
  })
  @Get('social/callback')
  async facebookCallback(
    @Query('code') code: string,
    @Query('state') state: SocialMediaPlatform,
    @Res() reply: FastifyReply
  ) {
    try {
      const platform = await this.authService.handleFacebookCallback(
        code,
        state
      );
      const successHtml = this.createResponseHtml(true, platform);
      reply.type('text/html').send(successHtml);
    } catch {
      const errorHtml = this.createResponseHtml(false, 'FACEBOOK');
      reply.type('text/html').send(errorHtml);
    }
  }

  private createResponseHtml(
    success: boolean,
    platform: SocialMediaPlatform
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head><title>Authentication</title></head>
      <body>
        <script>
          const targetOrigin = '${this.authService.getFrontendUrl()}';
          window.opener.postMessage({
            type: 'OAUTH_SUCCESS',
            success: ${success},
            platform: '${platform}'
          }, targetOrigin);
          window.close();
        </script>
        <p>Please wait...</p>
      </body>
      </html>
    `;
  }
}
