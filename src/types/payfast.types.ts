export interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  paymentUrl: string;
  isProduction: boolean;
}

export interface PaymentRequest {
  userId: string;
  email: string;
  phone?: string;
  fullName?: string;
  deliveryAddress?: string;
}

export interface PaymentResponse {
  paymentUrl: string;
  paymentReference: string;
  amount: number;
  merchantId: string;
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  CANCELLED = "cancelled",
  DECLINED = "declined",
  PROCESSING = "processing",
}

export interface PaymentStatusResponse {
  status: PaymentStatus;
  orderExists: boolean;
  order?: any;
  verified: boolean;
}

interface PaymentContext {
  userId: string;
  shippingAddress: any;
  paymentMethod: string;
  email: string;
  phone?: string;
  fullName?: string;
  timestamp: number;
}

export type { PaymentContext };
