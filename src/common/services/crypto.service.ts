import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CryptoService {
  private encryptionKey: Buffer;
  private iv: Buffer;

  constructor(private readonly configService: ConfigService) {
    const encryptionKeyHex = this.configService.get<string>('ENCRYPTION_KEY');
    const ivHex = this.configService.get<string>('IV');

    if (!encryptionKeyHex || !ivHex) {
      throw new Error('Missing encryption key or IV');
    }

    this.encryptionKey = Buffer.from(encryptionKeyHex, 'hex');
    this.iv = Buffer.from(ivHex, 'hex');
  }

  encryptData(data: string): string {
    const cipher = createCipheriv('aes-256-cbc', this.encryptionKey, this.iv);
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  }

  decryptData(encryptedData: string): string {
    try {
      const decipher = createDecipheriv(
        'aes-256-cbc',
        this.encryptionKey,
        this.iv,
      );
      let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt data');
    }
  }
}
