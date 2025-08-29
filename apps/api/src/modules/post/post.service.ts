import { Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';

import {
  MenuStatus,
  post,
  postSnapshot,
  socialMediaAccount,
  SocialMediaPlatform,
} from '@/schema';
import {
  DatabaseService,
  Transaction,
} from '@/shared/database/database.service';
import { CronHelperService } from '@/shared/services/cron.helper.service';

@Injectable()
export class PostService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cronHelperService: CronHelperService
  ) {}

  async getPostsByIds(ids: number[]) {
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
      .where(and(inArray(postSnapshot.snapshotId, ids)))
      .groupBy(postSnapshot.postId, post.status, socialMediaAccount.platform);

    return posts.filter(
      (
        p
      ): p is {
        postId: number;
        status: MenuStatus;
        platform: SocialMediaPlatform;
      } => p.platform !== null && p.status !== null
    );
  }

  async createPosts(
    snapshotIds: number[],
    settings: {
      socialAccountId: number;
      scheduleSettingsId: number;
      content: string | null;
      cron: string;
    }[],
    tx: Transaction
  ) {
    if (settings.length === 0 || snapshotIds.length === 0) {
      return;
    }

    const postsToCreate = settings.map(setting => ({
      socialMediaAccountId: setting.socialAccountId,
      status: 'SCHEDULED' as const,
      scheduleSettingsId: setting.scheduleSettingsId,
      content: setting.content,
      scheduledAt: this.cronHelperService.getNextScheduledAt(setting.cron),
    }));

    const newPosts = await tx
      .insert(post)
      .values(postsToCreate)
      .returning({ id: post.id });

    const postSnapshotValues = newPosts.flatMap(newPost =>
      snapshotIds.map(snapshotId => ({
        postId: newPost.id,
        snapshotId,
      }))
    );

    await tx.insert(postSnapshot).values(postSnapshotValues);
  }

  async deletePostsBySnapshotIds(ids: number[], tx: Transaction) {
    return tx
      .delete(post)
      .where(and(eq(post.status, 'SCHEDULED'), inArray(post.id, ids)));
  }
}
