import { Token } from "typedi";
import type { PaymentRequest, PaymentResponse, PaymentStatusResponse, CampaignClaimPaymentRequest } from "@/types/payfast.types";

export interface IPayfastService {
  generatePaymentFromCart(request: PaymentRequest): Promise<PaymentResponse>;
  generatePaymentForCampaignClaims(request: CampaignClaimPaymentRequest): Promise<PaymentResponse>;
  handlePayFastITN(itnData: any): Promise<{
    success: boolean;
    order?: any;
    message: string;
  }>;
  checkPaymentStatus(paymentReference: string): Promise<PaymentStatusResponse>;
}

export const PAYFAST_SERVICE_TOKEN = new Token<IPayfastService>("IPayfastService");
