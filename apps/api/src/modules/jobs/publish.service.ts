import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import {
  endOfISOWeek,
  format,
  getISOWeek,
  getISOWeekYear,
  startOfISOWeek,
} from 'date-fns';
import { eq, inArray } from 'drizzle-orm';
import { firstValueFrom } from 'rxjs';

import { post as postSchema } from '@/schema';
import { DatabaseService } from '@/shared/database/database.service';
import { DateRange } from '@/shared/pipes';
import { EncryptionService } from '@/shared/services/encryption.service';
import { R2StorageService } from '@/shared/services/r2-storage.service';

import { PdfService } from '../pdf/pdf.service';
import { PostService } from '../post/post.service';

interface FacebookPhotoResponse {
  id: string;
  post_id: string;
}

@Injectable()
export class PublishService {
  private readonly logger = new Logger(PublishService.name);
  private readonly FACEBOOK_GRAPH_API_URL = 'https://graph.facebook.com/v23.0';

  constructor(
    private readonly postService: PostService,
    private readonly pdfService: PdfService,
    private readonly r2StorageService: R2StorageService,
    private readonly encryptionService: EncryptionService,
    private readonly databaseService: DatabaseService,
    private readonly httpService: HttpService
  ) {}

  /**
   * Main entry point for the publishing job, typically triggered by a cron.
   */
  async triggerPublishing(): Promise<{
    processed: number;
    success: number;
    failed: number;
  }> {
    this.logger.log('🚀 Publishing job started.');

    // 1. Get posts that are due for publishing.
    const duePosts = await this.postService.findDuePostsWithAccounts();
    if (duePosts.length === 0) {
      this.logger.log('No posts are due for publishing.');
      return { processed: 0, success: 0, failed: 0 };
    }
    this.logger.log(`📬 Found ${duePosts.length} posts to publish.`);

    // 2. Lock the posts to prevent concurrent processing.
    const postIds = duePosts.map(p => p.post.id);
    // await this.databaseService.db
    //   .update(postSchema)
    //   .set({ status: 'PUBLISHING' })
    //   .where(inArray(postSchema.id, postIds));

    let successCount = 0;
    let failedCount = 0;

    const now = new Date();
    const dateRange: DateRange = {
      year: getISOWeekYear(now),
      weekNumber: getISOWeek(now),
      start: format(startOfISOWeek(now), 'yyyy-MM-dd'),
      end: format(endOfISOWeek(now), 'yyyy-MM-dd'),
    };

    // 3. Process each post sequentially to avoid overwhelming external APIs.
    for (const data of duePosts) {
      const { post, social_account } = data; // Destructure for cleaner access

      try {
        this.logger.log(`Processing post ID: ${post.id}...`);

        if (!social_account) {
          throw new Error('No associated social media account.');
        }

        // 3a. Generate the weekly menu image.
        const { buffer, fileName } =
          await this.pdfService.generateWeeklyMenuFile(
            social_account.restaurantId,
            dateRange,
            { format: 'png', platform: social_account.platform }
          );

        // 3b. Upload the generated image to R2 storage.
        const imageUrl = await this.r2StorageService.upload(
          buffer,
          fileName,
          'image/png'
        );
        this.logger.log(`Image uploaded to R2: ${imageUrl}`);

        // Persist the generated image URL to the database.
        // await this.databaseService.db
        //   .update(postSchema)
        //   .set({ generatedImageUrl: imageUrl })
        //   .where(eq(postSchema.id, post.id));

        // 3c. Decrypt the access token for the API call.
        const accessToken = this.encryptionService.decrypt(
          social_account.accessToken
        );

        let publishedUrl: string;

        // 3d. Post to the appropriate social media platform.
        switch (social_account.platform) {
          case 'FACEBOOK': {
            // Post photo with message to Facebook page
            const endpoint = `${this.FACEBOOK_GRAPH_API_URL}/${social_account.platformAccountId}/photos`;

            const params = {
              url: imageUrl, // Use the R2 image URL
              message: post.content || '',
              access_token: accessToken,
            };

            this.logger.log(
              `Posting photo to Facebook page: ${social_account.platformAccountId}`
            );

            const response = await firstValueFrom(
              this.httpService.post<FacebookPhotoResponse>(
                endpoint,
                {},
                {
                  params,
                }
              )
            );

            this.logger.log({
              message: 'Facebook photo post response',
              response: response.data,
            });

            const photoId = response.data.id;
            const postId = response.data.post_id;

            if (!photoId || !postId) {
              throw new Error(
                'Facebook API did not return valid photo/post IDs.'
              );
            }

            // Construct the real Facebook post URL using the post_id
            // Facebook post URLs have the format: https://www.facebook.com/{page_id}/posts/{post_id}
            // But the post_id from API is in format {page_id}_{actual_post_id}, so we need to extract it
            const actualPostId = postId.split('_')[1];
            publishedUrl = `https://www.facebook.com/${social_account.platformAccountId}/posts/${actualPostId}`;

            this.logger.log(`Facebook photo post created: ${publishedUrl}`);
            break;
          }

          case 'INSTAGRAM':
            // TODO: Implement Instagram publishing logic.
            this.logger.warn(
              `Instagram publishing is not yet implemented for post ID: ${post.id}`
            );
            throw new Error('Instagram publishing not implemented.');

          default:
            this.logger.error(
              `Unsupported platform: ${social_account.platform} for post ID: ${post.id}`
            );
            throw new Error(`Unsupported platform: ${social_account.platform}`);
        }

        // 3e. Update the post status to PUBLISHED and store the URL.
        // await this.databaseService.db
        //   .update(postSchema)
        //   .set({ status: 'PUBLISHED', postUrl: publishedUrl })
        //   .where(eq(postSchema.id, post.id));

        this.logger.log(`✅ Successfully published post ${post.id}`);
        successCount++;
      } catch (error) {
        // If one post fails, log it, update its status, and continue.
        failedCount++;
        const errorMessage = this.getErrorMessage(error);
        this.logger.error(
          `❌ Failed to process post ${post.id}: ${errorMessage}`,
          error.stack
        );

        // Update post status to FAILED with the reason.
        // await this.databaseService.db
        //   .update(postSchema)
        //   .set({ status: 'FAILED', failureReasonDetails: errorMessage })
        //   .where(eq(postSchema.id, post.id));
      }
    }

    this.logger.log(
      `Publishing job finished. Success: ${successCount}, Failed: ${failedCount}.`
    );

    return {
      processed: duePosts.length,
      success: successCount,
      failed: failedCount,
    };
  }

  /**
   * Extracts a descriptive error message from various error types.
   * Specifically handles AxiosError for detailed API error responses.
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      // Extract detailed error info from Facebook's Graph API response if available
      const apiError = error.response?.data?.error;
      if (apiError) {
        return `API Error: ${apiError.message} (Type: ${apiError.type}, Code: ${apiError.code})`;
      }
      return `Axios Error: ${error.message}`;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unknown error occurred.';
  }
}
