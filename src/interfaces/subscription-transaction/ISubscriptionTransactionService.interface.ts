import { Token } from "typedi";
import type { ISubscriptionTransaction, ICreateSubscriptionTransaction, IUpdateSubscriptionTransaction, ISubscriptionPaymentRequest, ISubscriptionPaymentResponse } from "@/types/subscription.types";

export interface ISubscriptionTransactionService {
  createTransaction(transactionData: ICreateSubscriptionTransaction): Promise<ISubscriptionTransaction>;
  getTransactionById(id: string): Promise<ISubscriptionTransaction | null>;
  getTransactionsByUserId(userId: string): Promise<ISubscriptionTransaction[]>;
  getAllTransactions(): Promise<ISubscriptionTransaction[]>;
  updateTransaction(updateData: IUpdateSubscriptionTransaction): Promise<ISubscriptionTransaction>;
  deleteTransaction(id: string): Promise<void>;
  generateSubscriptionPayment(request: ISubscriptionPaymentRequest): Promise<ISubscriptionPaymentResponse>;
  handleSubscriptionITN(itnData: any): Promise<{ success: boolean; transaction?: ISubscriptionTransaction; message: string }>;
}

export const SUBSCRIPTION_TRANSACTION_SERVICE_TOKEN = new Token<ISubscriptionTransactionService>("ISubscriptionTransactionService");
