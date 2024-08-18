import { Module } from '@nestjs/common';
import { PaystackService } from './paystack/paystack.service';
import { HttpModule } from '@nestjs/axios';
import { PaymentController } from './payment/payment.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth/auth.service';
import { CryptoService } from './common/services/crypto.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    HttpModule,
  ],
  controllers: [PaymentController],
  providers: [PaystackService, ConfigService, AuthService, CryptoService],
  exports: [ConfigService],
})
export class AppModule {}
