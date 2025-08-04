import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ClerkMiddleware } from '@/middleware/auth.middleware';
import { AuthModule } from '@/modules/auth/auth.module';

import { DrizzleModule } from '../shared/database/database.module';

@Module({
  imports: [
    DrizzleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ClerkMiddleware).forRoutes('*');
  }
}
