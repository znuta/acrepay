import { HttpService } from '@nestjs/axios';
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { createHmac } from 'crypto';
import { CryptoService } from 'src/common/services/crypto.service';

@Injectable()
export class PaystackService {
  private readonly secretKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    public readonly cryptoService: CryptoService,
  ) {
    this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    if (!this.secretKey) {
      throw new Error(
        'PAYSTACK_SECRET_KEY is not defined in the environment variables',
      );
    }
  }

  // Initialize Payment
  async initializePayment(
    initializePaymentDto: InitializePaymentDto,
  ): Promise<any> {
    const { email, amount, callback_url, saleid } = initializePaymentDto;

    // Validation
    if (!email || !amount || !callback_url) {
      throw new BadRequestException(
        'Email, amount, and callback URL are required.',
      );
    }

    const metadata = { email, total: amount, notify_url: callback_url, saleid };

    const url = 'https://api.paystack.co/transaction/initialize';
    const headers = {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await this.httpService
        .post(url, { email, amount, callback_url, metadata }, { headers })
        .toPromise();
      return response.data;
    } catch (error) {
      console.error('Payment Initialization Error:', error);
      throw new Error('Failed to initialize payment');
    }
  }

  // Verify Payment
  async verifyPayment(reference: string): Promise<any> {
    if (!reference) {
      throw new BadRequestException('Reference is required.');
    }

    const url = `https://api.paystack.co/transaction/verify/${reference}`;
    const headers = {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await this.httpService.get(url, { headers }).toPromise();
      return response.data;
    } catch (error) {
      console.error('Payment Verification Error:', error);
      throw new Error('Failed to verify payment');
    }
  }

  // Add the verifySignature method
  verifySignature(payload: any, signature: string): void {
    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    const hash = createHmac('sha512', secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (hash !== signature) {
      throw new BadRequestException('Invalid signature.');
    }
  }

  async notifyUrlSuccess(notifyUrl: string, payload: any): Promise<void> {
    const headers = {
      'Content-Type': 'application/json',
    };

    try {
      await this.httpService.get(notifyUrl, { headers }).toPromise();
    } catch (error) {
      console.error('Failed to notify success:', error);
    }
  }
}
