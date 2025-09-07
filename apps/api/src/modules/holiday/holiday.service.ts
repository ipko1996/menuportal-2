import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { availability, holiday } from '@/schema';
import { DatabaseService } from '@/shared/database/database.service';

import { CreateHolidayDto } from './dto/create-holiday.dto';
import { HolidayResponseDto } from './dto/holiday-response.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';

@Injectable()
export class HolidayService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    createHolidayDto: CreateHolidayDto,
    restaurantId: number
  ): Promise<HolidayResponseDto> {
    const existingHoliday = await this.databaseService.db
      .select()
      .from(holiday)
      .leftJoin(availability, eq(holiday.id, availability.entityId))
      .where(
        and(
          eq(availability.date, createHolidayDto.date),
          eq(holiday.restaurantId, restaurantId)
        )
      )
      .limit(1);

    if (existingHoliday.length > 0) {
      throw new ConflictException(
        'A holiday already exists on this date for the restaurant.'
      );
    }

    const newHoliday = await this.databaseService.db.transaction(async trx => {
      const [insertedHoliday] = await trx
        .insert(holiday)
        .values({
          name: createHolidayDto.name,
          restaurantId: restaurantId,
        })
        .returning();

      await trx.insert(availability).values({
        entityType: 'HOLIDAY' as const,
        entityId: insertedHoliday.id,
        date: createHolidayDto.date,
      });

      return insertedHoliday;
    });

    return {
      id: newHoliday.id,
      name: newHoliday.name,
      date: createHolidayDto.date,
      restaurantId: newHoliday.restaurantId,
    };
  }

  private async findHolidayById(id: number, restaurantId: number) {
    const result = await this.databaseService.db
      .select({
        id: holiday.id,
        name: holiday.name,
        restaurantId: holiday.restaurantId,
        date: availability.date,
      })
      .from(holiday)
      // Use innerJoin to ensure a holiday always has an associated availability record.
      // This simplifies error handling, as a missing date means the holiday is considered incomplete/not found.
      .innerJoin(availability, eq(holiday.id, availability.entityId))
      .where(
        and(
          eq(holiday.id, id),
          eq(holiday.restaurantId, restaurantId),
          // Ensure we are only joining with the correct entity type
          eq(availability.entityType, 'HOLIDAY')
        )
      )
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException(`Holiday with ID "${id}" not found.`);
    }

    // The innerJoin guarantees that result[0] and result[0].date are defined here.
    return result[0];
  }

  async update(
    id: number,
    updateHolidayDto: UpdateHolidayDto,
    restaurantId: number
  ): Promise<HolidayResponseDto> {
    await this.findHolidayById(id, restaurantId);

    await this.databaseService.db.transaction(async trx => {
      if (updateHolidayDto.name) {
        await trx
          .update(holiday)
          .set({ name: updateHolidayDto.name })
          .where(eq(holiday.id, id));
      }

      if (updateHolidayDto.date) {
        await trx
          .update(availability)
          .set({ date: updateHolidayDto.date })
          .where(
            and(
              eq(availability.entityId, id),
              eq(availability.entityType, 'HOLIDAY')
            )
          );
      }
    });

    return this.findHolidayById(id, restaurantId);
  }

  async remove(id: number, restaurantId: number) {
    await this.findHolidayById(id, restaurantId);

    await this.databaseService.db.transaction(async trx => {
      await trx
        .delete(availability)
        .where(
          and(
            eq(availability.entityId, id),
            eq(availability.entityType, 'HOLIDAY')
          )
        );

      await trx.delete(holiday).where(eq(holiday.id, id));
    });
  }
}
