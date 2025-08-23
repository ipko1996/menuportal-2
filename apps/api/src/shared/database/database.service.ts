import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from '@/schema';

type DrizzleInstance = ReturnType<typeof drizzle<typeof schema>>;
type TransactionCallback = Parameters<DrizzleInstance['transaction']>[0];
export type Transaction = Parameters<TransactionCallback>[0];

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;
  public db: ReturnType<typeof drizzle<typeof schema>>;

  constructor(private readonly configService: ConfigService) {
    const dbUrl = this.configService.getOrThrow<string>('DATABASE_URL');
    this.pool = new Pool({
      connectionString: dbUrl,
    });

    this.db = drizzle(this.pool, { schema });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.db.execute(sql`SELECT 1`);
      this.logger.log('Database connection established');
    } catch (error) {
      this.logger.error('Failed to connect to the database', error);
      throw new Error('Database connection failed');
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
    this.logger.log('Database connection closed');
  }
}
