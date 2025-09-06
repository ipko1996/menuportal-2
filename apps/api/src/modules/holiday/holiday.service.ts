import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
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
    // Check for existing holiday on the same date for the restaurant
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

    // Insert new holiday
    const newHoliday = await this.databaseService.db.transaction(async trx => {
      const [insertedHoliday] = await trx
        .insert(holiday)
        .values({
          name: createHolidayDto.name,
          restaurantId: restaurantId,
        })
        .returning();

      // Insert availability record for the holiday date
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

  async update(
    id: number,
    updateHolidayDto: UpdateHolidayDto,
    restaurantId: number
  ): Promise<HolidayResponseDto> {
    // Check if the holiday exists
    const [existingHoliday] = await this.databaseService.db
      .select({
        id: holiday.id,
        name: holiday.name,
        restaurantId: holiday.restaurantId,
        date: availability.date,
      })
      .from(holiday)
      .leftJoin(availability, eq(holiday.id, availability.entityId))
      .where(and(eq(holiday.id, id), eq(holiday.restaurantId, restaurantId)))
      .limit(1);

    if (!existingHoliday) {
      throw new NotFoundException('Holiday not found.');
    }

    // Update the holiday details
    return await this.databaseService.db.transaction(async trx => {
      // Update holiday name if provided
      if (updateHolidayDto.name) {
        await trx
          .update(holiday)
          .set({ name: updateHolidayDto.name })
          .where(eq(holiday.id, id));
      }

      // Update availability date if provided
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

      return {
        id: existingHoliday.id,
        name: updateHolidayDto.name ?? existingHoliday.name,
        date: updateHolidayDto.date ?? existingHoliday.date!, // TODO: solve this fucking shit
        restaurantId: existingHoliday.restaurantId,
      };
    });
  }

  async remove(id: number, restaurantId: number) {
    // Check if the holiday exists
    const existingHoliday = await this.databaseService.db
      .select()
      .from(holiday)
      .where(and(eq(holiday.id, id), eq(holiday.restaurantId, restaurantId)))
      .limit(1);

    if (existingHoliday.length === 0) {
      throw new ConflictException('Holiday not found.');
    }

    // Delete the holiday and associated availability
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
