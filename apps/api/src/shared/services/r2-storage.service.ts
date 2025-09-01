import * as crypto from 'node:crypto';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class R2StorageService {
  private readonly logger = new Logger(R2StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    const accountId = this.configService.getOrThrow<string>(
      'CLOUDFLARE_ACCOUNT_ID'
    );
    const accessKeyId = this.configService.getOrThrow<string>(
      'CLOUDFLARE_R2_ACCESS_KEY_ID'
    );
    const secretAccessKey = this.configService.getOrThrow<string>(
      'CLOUDFLARE_R2_SECRET_ACCESS_KEY'
    );
    this.bucketName = this.configService.getOrThrow<string>(
      'CLOUDFLARE_R2_BUCKET_NAME'
    );
    this.publicUrl = this.configService.getOrThrow<string>(
      'CLOUDFLARE_R2_PUBLIC_URL'
    );

    // Cloudflare R2 is S3-compatible. We initialize the S3 client with R2 details.
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * Uploads a file buffer to Cloudflare R2.
   * @param buffer The file content as a Buffer.
   * @param originalFileName The original name of the file, used to determine the file extension.
   * @param mimetype The MIME type of the file (e.g., 'image/png').
   * @returns The publicly accessible URL of the uploaded file.
   */
  async upload(
    buffer: Buffer,
    originalFileName: string,
    mimetype: string
  ): Promise<string> {
    const fileExtension = originalFileName.split('.').pop() || '';
    // Generate a unique file name to prevent overwrites and collisions.
    const uniqueFileName = `${crypto.randomUUID()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: uniqueFileName,
      Body: buffer,
      ContentType: mimetype,
      // You can add CacheControl if needed, e.g., 'public, max-age=31536000'
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(
        `File ${uniqueFileName} uploaded to R2 bucket ${this.bucketName}.`
      );
      // The public URL is constructed from your R2 public bucket URL and the new unique file name.
      return `${this.publicUrl}/${uniqueFileName}`;
    } catch (error) {
      this.logger.error(
        `Failed to upload file to R2: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException('Failed to upload file.');
    }
  }
}
