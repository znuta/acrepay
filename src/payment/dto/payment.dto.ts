// src/payment/dto/payment.dto.ts

export interface EncryptDataRequest {
  total: string;
  saleid: string;
  notify_url: string;
  email: string;
}

export interface InitializePaymentRequest {
  email: string;
  amount: number;
  callback_url: string;
  saleid: string;
}
