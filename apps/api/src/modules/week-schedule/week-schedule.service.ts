import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { and, between, count, eq, inArray } from 'drizzle-orm';

import {
  MenuStatus,
  post,
  postSnapshot,
  snapshot,
  snapshotItem,
  snapshotMenu,
  snapshotOffer,
  socialMediaAccount,
  SocialMediaPlatform,
} from '@/schema';
import { DatabaseService } from '@/shared/database/database.service';
import { DateRange } from '@/shared/pipes';

@Injectable()
export class WeekScheduleService {
  private readonly logger = new Logger(WeekScheduleService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async getExistingSchedules(
    dateRange: DateRange,
    restaurantId: number
  ): Promise<{
    snaps: (typeof snapshot.$inferSelect & {
      offers: (typeof snapshotOffer.$inferSelect)[];
      menus: (typeof snapshotMenu.$inferSelect)[];
      items: (typeof snapshotItem.$inferSelect)[];
    })[];
    posts: {
      postId: number;
      status: MenuStatus;
      platform: SocialMediaPlatform;
    }[];
  }> {
    const { start: startOfWeek, end: endOfWeek } = dateRange;

    const snaps = await this.databaseService.db.query.snapshot.findMany({
      where: and(
        eq(snapshot.restaurantId, restaurantId),
        between(snapshot.date, startOfWeek, endOfWeek)
      ),
      with: {
        offers: true,
        menus: true,
        items: true,
      },
    });

    const posts = await this.databaseService.db
      .select({
        postId: postSnapshot.postId,
        status: post.status,
        platform: socialMediaAccount.platform,
      })
      .from(postSnapshot)
      .leftJoin(post, eq(post.id, postSnapshot.postId))
      .leftJoin(
        socialMediaAccount,
        eq(socialMediaAccount.id, post.socialMediaAccountId)
      )
      .where(
        inArray(
          postSnapshot.snapshotId,
          snaps.map(s => s.id)
        )
      )
      .groupBy(postSnapshot.postId, post.status, socialMediaAccount.platform);

    this.logger.log(posts);

    return {
      snaps,
      posts: posts.filter(
        (
          p
        ): p is {
          postId: number;
          status: MenuStatus;
          platform: SocialMediaPlatform;
        } => p.status !== null
      ),
    };
  }
}
