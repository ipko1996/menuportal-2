import * as crypto from 'node:crypto';

import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm: crypto.CipherGCMTypes = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
    if (!encryptionKey) {
      this.logger.error('ENCRYPTION_KEY is not set in environment variables.');
      throw new InternalServerErrorException(
        'Encryption key is not configured.'
      );
    }
    // The key must be 32 bytes for aes-256-gcm
    this.key = Buffer.from(encryptionKey, 'base64');
  }

  /**
   * Encrypts a plain text string.
   * @param text The plain text to encrypt.
   * @returns A string containing the IV, auth tag, and encrypted text, separated by colons.
   */
  encrypt(text: string): string {
    // Generate a new, random Initialization Vector (IV) for each encryption.
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // The auth tag is crucial for GCM mode to ensure data integrity.
    const authTag = cipher.getAuthTag();

    // Prepend the IV and auth tag to the encrypted text for later use in decryption.
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypts an encrypted string.
   * @param encryptedText The encrypted string (iv:authTag:encryptedText).
   * @returns The original plain text.
   */
  decrypt(encryptedText: string): string {
    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted text format.');
      }

      const [ivHex, authTagHex, encryptedDataHex] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedDataHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logger.error('Decryption failed', error.stack);
      throw new InternalServerErrorException('Failed to decrypt data.');
    }
  }
}
