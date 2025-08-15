import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { dishType } from '@/schema';
import { DatabaseService } from '@/shared/database/database.service';

@Injectable()
export class DishtypeService {
  private readonly logger = new Logger(DishtypeService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    return await this.databaseService.db
      .select({
        id: dishType.id,
        name: dishType.dishTypeName,
        dishTypeValue: dishType.dishTypeValue,
      })
      .from(dishType)
      .where(eq(dishType.enabled, true));
  }
}
