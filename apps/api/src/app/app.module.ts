import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ClerkMiddleware } from '@/middleware/auth.middleware';
import { AuthModule } from '@/modules/auth/auth.module';
import { DishModule } from '@/modules/dish/dish.module';
import { DishtypeModule } from '@/modules/dishtype/dishtype.module';
import { HolidayModule } from '@/modules/holiday/holiday.module';
import { PublishModule } from '@/modules/jobs/publish.module';
import { MenuModule } from '@/modules/menu/menu.module';
import { OfferModule } from '@/modules/offer/offer.module';
import { PdfModule } from '@/modules/pdf/pdf.module';
import { ScheduleModule } from '@/modules/schedule/schedule.module';
import { SocialModule } from '@/modules/social/social.module';
import { TemplatesModule } from '@/modules/template/templates.module';
import { WeekMenuModule } from '@/modules/week-menu/week-menu.module';

import { DrizzleModule } from '../shared/database/database.module';

@Module({
  imports: [
    DrizzleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    DishModule,
    DishtypeModule,
    HolidayModule,
    MenuModule,
    OfferModule,
    PdfModule,
    PublishModule,
    ScheduleModule,
    SocialModule,
    TemplatesModule,
    WeekMenuModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(ClerkMiddleware)
      .exclude(
        {
          path: '/auth/social/FACEBOOK/callback',
          method: RequestMethod.GET,
        },
        {
          path: '/jobs/publish',
          method: RequestMethod.ALL,
        }
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
