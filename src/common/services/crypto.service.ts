import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CryptoService {
  private encryptionKey: Buffer;
  private iv: Buffer;

  constructor(private readonly configService: ConfigService) {
    // const encryptionKeyHex = this.configService.get<string>('ENCRYPTION_KEY');
    // const ivHex = this.configService.get<string>('IV');
    const encryptionKeyHex =
      'e4b3f9c9f8fbb2e5a634d56b39bbd6cf8a2bfb1d75ff2e7b6f4d9e594c9d02d1';
    const ivHex = 'a3d8b9c7854fdb2a842b4577bb563e7a';
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
