// src/paystack/dto/initialize-payment.dto.ts

import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class InitializePaymentDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  callback_url: string;

  saleid: string;
}

export class EncryptDataRequest {
  @IsNotEmpty()
  @IsString()
  total: string;

  @IsNotEmpty()
  @IsString()
  saleid: string;

  @IsNotEmpty()
  @IsString()
  notify_url: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class InitializePaymentRequest {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  @IsString()
  callback_url: string;

  saleid: string;
}
