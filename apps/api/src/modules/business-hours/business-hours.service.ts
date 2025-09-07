import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, inArray, ne, sql } from 'drizzle-orm';

import { businessHours, DayName } from '@/schema';
import { DatabaseService } from '@/shared/database/database.service';

import {
  CreateBulkBusinessHourDto,
  CreateBusinessHourDto,
} from './dto/create-business-hour.dto';
import { UpdateBusinessHourDto } from './dto/update-business-hour.dto';

@Injectable()
export class BusinessHoursService {
  constructor(private readonly databaseService: DatabaseService) {}

  private validateOpenBeforeClose(openingTime: string, closingTime: string) {
    const [openHour, openMinute] = openingTime.split(':').map(Number);
    const [closeHour, closeMinute] = closingTime.split(':').map(Number);

    if (
      openHour > closeHour ||
      (openHour === closeHour && openMinute >= closeMinute)
    ) {
      throw new BadRequestException(
        'Opening time must be before closing time.'
      );
    }
  }

  async create(
    createBusinessHourDto: CreateBusinessHourDto,
    restaurantId: number
  ) {
    const { dayOfWeek, openingTime, closingTime } = createBusinessHourDto;

    // Check if a business hour entry for the same day already exists for this restaurant
    const existingEntry = await this.databaseService.db
      .select()
      .from(businessHours)
      .where(
        and(
          eq(businessHours.dayOfWeek, dayOfWeek),
          eq(businessHours.restaurantId, restaurantId)
        )
      );
    if (existingEntry.length > 0) {
      throw new ConflictException(
        `Business hours for ${dayOfWeek} already exist for this restaurant.`
      );
    }
    this.validateOpenBeforeClose(openingTime, closingTime);

    return await this.databaseService.db
      .insert(businessHours)
      .values({
        dayOfWeek,
        openingTime,
        closingTime,
        restaurantId,
      })
      .returning();
  }

  async createBulk(
    createBusinessHourDtos: CreateBulkBusinessHourDto,
    restaurantId: number
  ) {
    const { businessHours: businessHoursDto } = createBusinessHourDtos;
    if (!businessHoursDto || businessHoursDto.length === 0) {
      throw new BadRequestException('Business hours array cannot be empty.');
    }

    // --- Validations for the whole array ---

    const daysOfWeekInPayload = new Set<DayName>();
    for (const dto of businessHoursDto) {
      // 1. Validate each entry's times
      this.validateOpenBeforeClose(dto.openingTime, dto.closingTime);

      // 2. Check for duplicate days within the payload itself
      if (daysOfWeekInPayload.has(dto.dayOfWeek)) {
        throw new BadRequestException(
          `Duplicate entry for ${dto.dayOfWeek} in the request.`
        );
      }
      daysOfWeekInPayload.add(dto.dayOfWeek);
    }

    // --- Database Operations within a Transaction ---
    return await this.databaseService.db.transaction(async tx => {
      // 3. Check for conflicts with existing entries in the DB in a single query
      const existingEntries = await tx
        .select({ day: businessHours.dayOfWeek })
        .from(businessHours)
        .where(
          and(
            eq(businessHours.restaurantId, restaurantId),
            inArray(businessHours.dayOfWeek, [...daysOfWeekInPayload])
          )
        );

      if (existingEntries.length > 0) {
        const conflictingDays = existingEntries.map(e => e.day).join(', ');
        throw new ConflictException(
          `Business hours already exist for: ${conflictingDays}.`
        );
      }

      // 4. Perform a single bulk insert operation
      const valuesToInsert = businessHoursDto.map(dto => ({
        ...dto,
        restaurantId,
      }));

      return await tx.insert(businessHours).values(valuesToInsert).returning();
    });
  }

  async findAll(restaurantId: number) {
    // A custom order to ensure days are sorted logically (Sunday -> Saturday)
    // instead of alphabetically.
    const dayOrder = sql<number>`
      CASE
        WHEN ${businessHours.dayOfWeek} = 'SUNDAY' THEN 0
        WHEN ${businessHours.dayOfWeek} = 'MONDAY' THEN 1
        WHEN ${businessHours.dayOfWeek} = 'TUESDAY' THEN 2
        WHEN ${businessHours.dayOfWeek} = 'WEDNESDAY' THEN 3
        WHEN ${businessHours.dayOfWeek} = 'THURSDAY' THEN 4
        WHEN ${businessHours.dayOfWeek} = 'FRIDAY' THEN 5
        WHEN ${businessHours.dayOfWeek} = 'SATURDAY' THEN 6
      END`;

    return await this.databaseService.db
      .select()
      .from(businessHours)
      .where(eq(businessHours.restaurantId, restaurantId))
      .orderBy(dayOrder);
  }

  /**
   * Updates a specific business hour entry.
   * Ensures the entry belongs to the user's restaurant.
   */
  async update(
    id: number,
    updateBusinessHourDto: UpdateBusinessHourDto,
    restaurantId: number
  ) {
    return await this.databaseService.db.transaction(async tx => {
      // 1. Find the existing entry to ensure it exists and belongs to the restaurant
      const [existingEntry] = await tx
        .select()
        .from(businessHours)
        .where(
          and(
            eq(businessHours.id, id),
            eq(businessHours.restaurantId, restaurantId)
          )
        );

      if (!existingEntry) {
        throw new NotFoundException(`Business hour with ID ${id} not found.`);
      }

      // 2. Validate times
      const openingTime =
        updateBusinessHourDto.openingTime ?? existingEntry.openingTime;
      const closingTime =
        updateBusinessHourDto.closingTime ?? existingEntry.closingTime;
      this.validateOpenBeforeClose(openingTime, closingTime);

      // 3. If dayOfWeek is being changed, check for conflicts
      if (updateBusinessHourDto.dayOfWeek) {
        const [conflict] = await tx
          .select()
          .from(businessHours)
          .where(
            and(
              eq(businessHours.restaurantId, restaurantId),
              eq(businessHours.dayOfWeek, updateBusinessHourDto.dayOfWeek),
              ne(businessHours.id, id) // Ensure it's not the same entry we are updating
            )
          );

        if (conflict) {
          throw new ConflictException(
            `Business hours for ${updateBusinessHourDto.dayOfWeek} already exist.`
          );
        }
      }

      // 4. Perform the update
      const [updatedEntry] = await tx
        .update(businessHours)
        .set(updateBusinessHourDto)
        .where(
          // Redundant where clause, but good for safety
          and(
            eq(businessHours.id, id),
            eq(businessHours.restaurantId, restaurantId)
          )
        )
        .returning();

      return updatedEntry;
    });
  }

  /**
   * Removes a specific business hour entry.
   * Ensures the entry belongs to the user's restaurant before deleting.
   */
  async remove(id: number, restaurantId: number) {
    // The `where` clause here is crucial for security. It ensures you can only
    // delete an entry if its ID matches AND it belongs to your restaurant.
    const [deletedEntry] = await this.databaseService.db
      .delete(businessHours)
      .where(
        and(
          eq(businessHours.id, id),
          eq(businessHours.restaurantId, restaurantId)
        )
      )
      .returning();

    // If `deletedEntry` is undefined, it means no row was found that matched
    // BOTH the ID and the restaurantId.
    if (!deletedEntry) {
      throw new NotFoundException(`Business hour with ID ${id} not found.`);
    }

    return deletedEntry;
  }
}
