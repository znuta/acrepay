import { Injectable, Logger } from '@nestjs/common';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

@Injectable()
export class AuthService {
  private readonly apiKeys: Map<string, string> = new Map();
  private readonly logger = new Logger(AuthService.name);
  private readonly encryptionKey: Buffer;
  private readonly iv: Buffer;

  constructor() {
    // Generate a secure encryption key and initialization vector
    this.encryptionKey = randomBytes(32); // 256-bit key
    this.iv = randomBytes(16); // 128-bit IV

    this.generateDefaultUser();
  }

  private encryptApiKey(apiKey: string): string {
    const cipher = createCipheriv('aes-256-cbc', this.encryptionKey, this.iv);
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  private decryptApiKey(encryptedApiKey: string): string {
    const decipher = createDecipheriv(
      'aes-256-cbc',
      this.encryptionKey,
      this.iv,
    );
    let decrypted = decipher.update(encryptedApiKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private generateDefaultUser() {
    const apiKey = randomBytes(32).toString('hex');
    const encryptedApiKey = this.encryptApiKey(apiKey);
    const userId = 'defaultUser';
    this.apiKeys.set(encryptedApiKey, userId);

    // Log the original API key (not the encrypted version)
    this.logger.log(`API Key for default user: ${apiKey}`);
  }

  validateApiKey(apiKey: string): boolean {
    // Compare the encrypted version of the provided key with the stored keys
    const encryptedApiKey = this.encryptApiKey(apiKey);
    return this.apiKeys.has(encryptedApiKey);
  }

  getUserId(apiKey: string): string {
    const encryptedApiKey = this.encryptApiKey(apiKey);
    return this.apiKeys.get(encryptedApiKey);
  }
}
