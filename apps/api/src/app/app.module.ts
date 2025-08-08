import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ClerkMiddleware } from '@/middleware/auth.middleware';
import { AuthModule } from '@/modules/auth/auth.module';
import { DishModule } from '@/modules/dish/dish.module';
import { OfferModule } from '@/modules/offer/offer.module';

import { DrizzleModule } from '../shared/database/database.module';

@Module({
  imports: [
    DrizzleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    DishModule,
    OfferModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ClerkMiddleware).forRoutes('*');
  }
}
