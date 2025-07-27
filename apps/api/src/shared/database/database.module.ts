import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseService } from './database.service';

@Global()
@Module({})
export class DrizzleModule {
  static forRoot(): DynamicModule {
    return {
      module: DrizzleModule,
      providers: [DatabaseService],
      exports: [DatabaseService],
    };
  }
}
