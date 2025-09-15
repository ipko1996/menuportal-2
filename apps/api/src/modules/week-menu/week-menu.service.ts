import { Injectable, Logger } from '@nestjs/common';
import {
  addWeeks,
  isBefore,
  isSameWeek,
  parseISO,
  startOfISOWeek,
} from 'date-fns';

import { MenuStatusApi } from '@/schema';
import type { DateRange } from '@/shared/pipes';
import { WeeklyOfferQueryService } from '@/shared/services/weekly-offer-query.service';

import { PostService } from '../post/post.service';
import { SnapshotService } from '../snapshot/snapshot.service';
import { SocialService } from '../social/social.service';
import { WeekMenuResponseDto } from './dto/week-menu-response.dto';

@Injectable()
export class WeekMenuService {
  private readonly logger = new Logger(WeekMenuService.name);

  constructor(
    private readonly weeklyOfferQueryService: WeeklyOfferQueryService,
    private readonly snapshotService: SnapshotService,
    private readonly postService: PostService,
    private readonly social: SocialService
  ) {}

  /**
   * Returns the full weekly menu response, including status and week boundaries.
   * @param dateRange The start and end dates for the week.
   * @param restaurantId The ID of the restaurant.
   * @returns A promise that resolves to the weekly menu response DTO.
   */
  async getMenusForWeek(
    dateRange: DateRange,
    restaurantId: number
  ): Promise<WeekMenuResponseDto> {
    this.logger.log(
      `Fetching menus for week: ${dateRange.start} to ${dateRange.end}`
    );

    const existingSchedules = await this.snapshotService.getSnapshotsForWeek(
      dateRange,
      restaurantId
    );
    const socials = await this.social.findAllSocaialsForRestaurant(
      restaurantId
    );
    let isAccountSetup = socials.length > 0;
    if (!isAccountSetup) {
      isAccountSetup = socials.some(s => s.isActive);
    }

    const posts = await this.postService.getPostsByIds(existingSchedules.snaps);

    const now = new Date();
    const { start, end } = dateRange;
    const weekStart = parseISO(start);
    const weekEnd = parseISO(end);

    let weekStatus: MenuStatusApi = 'DRAFT';
    let days: WeekMenuResponseDto['days'] = existingSchedules.days;
    const isPast = isBefore(weekEnd, now);
    const isCurrentWeek = isSameWeek(weekStart, now, { weekStartsOn: 1 });
    const isPlanningWeek = isSameWeek(
      weekStart,
      startOfISOWeek(addWeeks(now, 1)),
      { weekStartsOn: 1 }
    );

    if (posts.length > 0) {
      this.logger.warn(
        `Week ${start} to ${end} is already scheduled, published, or failed for restaurant ${restaurantId}`
      );

      const hasPublished = posts.some(p => p.status === 'PUBLISHED');
      const hasFailed = posts.some(p => p.status === 'FAILED');
      const hasScheduled = posts.some(p => p.status === 'SCHEDULED');

      // All same status cases
      if (posts.every(p => p.status === 'PUBLISHED')) {
        weekStatus = 'PUBLISHED';
      } else if (posts.every(p => p.status === 'PUBLISHING')) {
        weekStatus = 'PUBLISHING';
      } else if (posts.every(p => p.status === 'FAILED')) {
        weekStatus = 'FAILED';
      } else if (posts.every(p => p.status === 'SCHEDULED')) {
        weekStatus = 'SCHEDULED';
      } else if (hasPublished) {
        // Any mix with published posts = partially failed
        weekStatus = 'PARTIALLY_FAILED';
      } else if (hasScheduled && hasFailed) {
        // Scheduled + failed (no published) = failed dominates
        weekStatus = 'FAILED';
      } else {
        // Fallback (shouldn't happen)
        weekStatus = 'PARTIALLY_FAILED';
      }
    } else {
      weekStatus = 'DRAFT';
      days = await this.weeklyOfferQueryService.getWeeklyDataForWeek(
        dateRange,
        restaurantId
      );
    }

    return {
      posts,
      weekStatus,
      weekStart: start,
      weekEnd: end,
      days,
      isAccountSetup,
      isEmpty: this.isWeekEmpty(days),
      isPast,
      isCurrentWeek,
      isPlanningWeek,
    };
  }

  private isWeekEmpty(days: WeekMenuResponseDto['days']): boolean {
    return Object.values(days).every(
      day => day.offers.length === 0 && day.menus.length === 0
    );
  }
}
