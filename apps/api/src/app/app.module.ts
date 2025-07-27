import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DrizzleModule } from '../shared/database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    DrizzleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
