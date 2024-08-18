import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  UseGuards,
  Res,
  BadRequestException,
  Headers,
} from '@nestjs/common';
import { Response } from 'express';
import { PaystackService } from '../paystack/paystack.service';
import { ApiKeyGuard } from '../api-key/api-key.guard';
import {
  EncryptDataRequest,
  InitializePaymentRequest,
} from './dto/payment.dto';
import { CryptoService } from 'src/common/services/crypto.service';

// Uncomment the guard to use API key protection
// @UseGuards(ApiKeyGuard)
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paystackService: PaystackService,
    private readonly cryptoService: CryptoService,
  ) {}

  @Post('encrypt')
  encryptDataPost(@Body() encryptDataDto: EncryptDataRequest): string {
    const { total, saleid, notify_url, email } = encryptDataDto;

    const data = JSON.stringify({ total, saleid, notify_url, email });
    const encryptedData = this.cryptoService.encryptData(data);

    // Return the encrypted data as a URL-encoded string
    return encodeURIComponent(encryptedData);
  }

  @Post('initialize')
  async initializePayment(
    @Body() initializePaymentDto: InitializePaymentRequest,
  ) {
    const { email, amount, callback_url, saleid } = initializePaymentDto;
    return await this.paystackService.initializePayment(initializePaymentDto);
  }

  @Get('pay')
  async checkoutPayment(@Query('keys') keys: string, @Res() res: Response) {
    if (!keys) {
      throw new BadRequestException('Keys parameter is required.');
    }

    const keyData = this.cryptoService.decryptData(keys);
    const { email, total, notify_url, saleid } = JSON.parse(keyData);

    // Ensure the decrypted data contains necessary fields
    if (!email || !total || !notify_url || !notify_url) {
      throw new BadRequestException(
        'Decrypted data is missing required fields.',
      );
    }

    const paystackResponse = await this.paystackService.initializePayment({
      email,
      amount: parseFloat(total),
      callback_url: notify_url,
      saleid,
    });
    const { authorization_url } = paystackResponse.data;

    // Redirect to the authorization URL
    return res.redirect(authorization_url);
  }

  @Get('verify')
  async verifyPayment(@Query('reference') reference: string) {
    if (!reference) {
      throw new BadRequestException('Reference parameter is required.');
    }

    return await this.paystackService.verifyPayment(reference);
  }

  @Post('callback')
  async handleCallback(@Body() payload: any) {
    // Process the callback payload here, update order status, etc.
    // Add validation and processing logic as needed
  }

  @Post('webhook')
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-paystack-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Signature is required.');
    }

    // Verify Paystack signature
    this.paystackService.verifySignature(payload, signature);

    // Process the decrypted data
    const metadata = payload.data.metadata; // Assuming 'keys' is stored in metadata
    // const decryptedData = this.cryptoService.decryptData(keys);
    const { notify_url } = metadata;

    // Perform necessary processing, e.g., update order status

    // Send a successful response to the notify_url
    await this.paystackService.notifyUrlSuccess(notify_url, metadata);

    return { status: 'success' };
  }
}
