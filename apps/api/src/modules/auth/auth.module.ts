import { Global, Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClerkService } from './clerk.service';

@Global()
@Module({
  providers: [ClerkService, AuthService],
  exports: [ClerkService, AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
