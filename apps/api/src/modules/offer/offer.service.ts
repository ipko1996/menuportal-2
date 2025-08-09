import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { availability, offer } from '@/schema';
import { DatabaseService } from '@/shared/database/database.service';

import { DishService } from '../dish/dish.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OfferResponseDto } from './dto/offer-response.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Injectable()
export class OfferService {
  private readonly logger = new Logger(OfferService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly dishService: DishService
  ) {}

  async create(
    createOfferDto: CreateOfferDto,
    restaurantId: number
  ): Promise<OfferResponseDto> {
    const { availability: offerAvailability, dishId, price } = createOfferDto;

    // Validate dishId that it exists in the restaurant
    await this.dishService.findDishById(dishId, restaurantId);

    try {
      const [newOffer, newAvailability] =
        await this.databaseService.db.transaction(async tx => {
          const [newOffer] = await tx
            .insert(offer)
            .values({
              dishId,
              restaurantId,
              price,
            })
            .returning();

          const [newAvailability] = await tx
            .insert(availability)
            .values({
              date: offerAvailability,
              entityId: newOffer.id,
              entityType: 'OFFER',
            })
            .returning();
          return [newOffer, newAvailability];
        });

      return {
        id: newOffer.id,
        dishId: newOffer.dishId,
        price: newOffer.price,
        availability: newAvailability.date,
      };
    } catch (error) {
      this.logger.error('Error creating offer', error);
      throw new InternalServerErrorException('Failed to create offer');
    }
  }

  findAll() {
    return `This action returns all offer`;
  }

  async findOne(id: number): Promise<OfferResponseDto> {
    const [offerData] = await this.databaseService.db
      .select()
      .from(offer)
      .leftJoin(availability, eq(availability.entityId, offer.id))
      .where(eq(offer.id, id))
      .limit(1);

    if (!offerData) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    if (offerData.availability === null) {
      throw new InternalServerErrorException(
        `Offer with ID ${id} does not have availability set`
      );
    }

    return {
      id: offerData.offer.id,
      dishId: offerData.offer.dishId,
      price: offerData.offer.price,
      availability: offerData.availability.date,
    };
  }

  async update(
    id: number,
    updateOfferDto: UpdateOfferDto,
    restaurantId: number
  ): Promise<OfferResponseDto> {
    const { dishId, price, availability: offerAvailability } = updateOfferDto;

    // First, verify the offer exists and belongs to the restaurant
    const existingOffer = await this.databaseService.db.query.offer.findFirst({
      where: and(eq(offer.id, id), eq(offer.restaurantId, restaurantId)),
    });

    if (!existingOffer) {
      throw new NotFoundException('Offer not found');
    }

    // If dishId is being updated, validate it exists in the restaurant
    if (dishId && dishId !== existingOffer.dishId) {
      await this.dishService.findDishById(dishId, restaurantId);
    }

    // Get availability for the offer
    const existingAvailability =
      await this.databaseService.db.query.availability.findFirst({
        where: and(
          eq(availability.entityId, id),
          eq(availability.entityType, 'OFFER')
        ),
      });
    if (!existingAvailability) {
      // All offers must have availability upon creation, something very bad happened
      throw new InternalServerErrorException('Offer availability not found');
    }

    try {
      const [updatedOffer, updatedAvailability] =
        await this.databaseService.db.transaction(async tx => {
          const updateData: Partial<typeof offer.$inferInsert> = {};
          if (dishId !== undefined) updateData.dishId = dishId;
          if (price !== undefined) updateData.price = price;

          const [offerResult] = await tx
            .update(offer)
            .set(updateData)
            .where(eq(offer.id, id))
            .returning();

          let availabilityResult: typeof availability.$inferInsert | undefined;
          if (offerAvailability) {
            [availabilityResult] = await tx
              .update(availability)
              .set({ date: offerAvailability })
              .where(
                and(
                  eq(availability.entityId, id),
                  eq(availability.entityType, 'OFFER')
                )
              )
              .returning();
          }

          return [offerResult, availabilityResult ?? existingAvailability];
        });

      return {
        id: updatedOffer.id,
        dishId: updatedOffer.dishId,
        price: updatedOffer.price,
        availability: updatedAvailability?.date || existingAvailability.date,
      };
    } catch (error) {
      this.logger.error('Error updating offer', error);
      throw new InternalServerErrorException('Failed to update offer');
    }
  }

  async remove(id: number, restaurantId: number): Promise<void> {
    // First check if offer exists
    const existingOffer = await this.databaseService.db.query.offer.findFirst({
      where: and(eq(offer.id, id), eq(offer.restaurantId, restaurantId)),
    });

    if (!existingOffer) {
      throw new NotFoundException('Offer not found');
    }

    return this.databaseService.db.transaction(async tx => {
      // Delete the availability first
      await tx
        .delete(availability)
        .where(
          and(
            eq(availability.entityId, id),
            eq(availability.entityType, 'OFFER')
          )
        );

      // Then delete the offer
      const result = await tx
        .delete(offer)
        .where(eq(offer.id, id))
        .returning({ id: offer.id });

      if (result.length === 0) {
        throw new InternalServerErrorException('Failed to delete offer');
      }
    });
  }
}
