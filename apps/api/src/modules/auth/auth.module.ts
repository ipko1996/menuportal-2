import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClerkService } from './clerk.service';

@Global()
@Module({
  providers: [ClerkService, AuthService],
  exports: [ClerkService, AuthService],
  controllers: [AuthController],
  imports: [HttpModule, ConfigModule],
})
export class AuthModule {}
