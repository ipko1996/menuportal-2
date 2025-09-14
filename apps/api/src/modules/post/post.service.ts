import { Injectable, Logger } from '@nestjs/common';
import { format } from 'date-fns';
import { and, eq, gte, inArray, lte, notExists } from 'drizzle-orm';

import {
  MenuStatus,
  platformSchedules,
  post,
  postSnapshot,
  schedules,
  ScheduleType,
  socialMediaAccount,
  SocialMediaPlatform,
} from '@/schema';
import {
  DatabaseService,
  Transaction,
} from '@/shared/database/database.service';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);
  constructor(private readonly databaseService: DatabaseService) {}

  async getPostsByIds(ids: number[]) {
    const posts = await this.databaseService.db
      .select({
        postId: postSnapshot.postId,
        status: post.status,
        platform: socialMediaAccount.platform,
        scheduledAt: post.scheduledAt,
        scheduleType: schedules.scheduleType,
      })
      .from(postSnapshot)
      .leftJoin(post, eq(post.id, postSnapshot.postId))
      .leftJoin(
        socialMediaAccount,
        eq(socialMediaAccount.id, post.socialMediaAccountId)
      )
      .leftJoin(
        platformSchedules,
        eq(platformSchedules.id, post.platformScheduleId)
      )
      .leftJoin(schedules, eq(schedules.id, platformSchedules.scheduleId))
      .where(and(inArray(postSnapshot.snapshotId, ids)))
      .groupBy(
        postSnapshot.postId,
        post.status,
        socialMediaAccount.platform,
        post.scheduledAt,
        schedules.scheduleType
      );

    return posts.filter(
      (
        p
      ): p is {
        postId: number;
        status: MenuStatus;
        platform: SocialMediaPlatform;
        scheduledAt: string;
        scheduleType: ScheduleType;
      } => p.platform !== null && p.status !== null
    );
  }

  async findDuePostsWithAccounts() {
    const now = new Date();

    const formattedNow = format(now, 'yyyy-MM-dd HH:mm:ss.SSSxxx');
    return await this.databaseService.db
      .select()
      .from(post)
      .leftJoin(
        socialMediaAccount,
        eq(socialMediaAccount.id, post.socialMediaAccountId)
      )
      .where(
        and(
          eq(post.status, 'SCHEDULED'),
          eq(socialMediaAccount.isActive, true),
          lte(post.scheduledAt, formattedNow)
        )
      )
      .orderBy(post.scheduledAt);
  }

  async updateStatusByIds(
    postIds: number[],
    status: MenuStatus,
    tx?: Transaction
  ) {
    const db = tx ?? this.databaseService.db;
    return await db
      .update(post)
      .set({ status })
      .where(inArray(post.id, postIds));
  }

  async createPostsAndLinkSnapshots(
    snapshotIds: number[],
    postsToCreate: Array<
      Omit<
        typeof post.$inferInsert,
        'id' | 'createdAt' | 'generatedImageUrl' | 'generatedPdfUrl'
      >
    >,
    tx: Transaction
  ) {
    if (postsToCreate.length === 0 || snapshotIds.length === 0) {
      this.logger.warn(
        'Aborting post creation: No posts to create or no snapshots to link.'
      );
      return;
    }

    this.logger.debug({
      message: 'Creating posts and linking to snapshots',
      postsToCreate,
      snapshotIds,
    });

    // 1. Bulk insert all the new post records.
    const newPosts = await tx
      .insert(post)
      .values(postsToCreate)
      .returning({ id: post.id });

    // 2. Prepare the values for the post_snapshot junction table.
    // This links every new post to every snapshot for the week.
    const postSnapshotValues = newPosts.flatMap(newPost =>
      snapshotIds.map(snapshotId => ({
        postId: newPost.id,
        snapshotId,
      }))
    );

    if (postSnapshotValues.length === 0) {
      return;
    }

    // 3. Bulk insert the linking records.
    await tx.insert(postSnapshot).values(postSnapshotValues);
  }

  async deletePostsForSnapshots(ids: number[], tx: Transaction) {
    // Delete the join rows
    await tx.delete(postSnapshot).where(inArray(postSnapshot.snapshotId, ids));

    // Delete posts that:
    //   1. Have no more snapshots
    //   2. Are still SCHEDULED
    return tx
      .delete(post)
      .where(
        and(
          eq(post.status, 'SCHEDULED'),
          notExists(
            tx
              .select()
              .from(postSnapshot)
              .where(eq(postSnapshot.postId, post.id))
          )
        )
      );
  }
}
