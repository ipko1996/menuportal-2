import { DynamicModule, Global, Module } from '@nestjs/common';

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
