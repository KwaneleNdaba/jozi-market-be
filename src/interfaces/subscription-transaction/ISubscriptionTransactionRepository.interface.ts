import { Token } from "typedi";
import type { ISubscriptionTransaction, ICreateSubscriptionTransaction, IUpdateSubscriptionTransaction } from "@/types/subscription.types";

export interface ISubscriptionTransactionRepository {
  create(transactionData: ICreateSubscriptionTransaction): Promise<ISubscriptionTransaction>;
  findById(id: string): Promise<ISubscriptionTransaction | null>;
  findByPaymentReference(paymentReference: string): Promise<ISubscriptionTransaction | null>;
  findByUserId(userId: string): Promise<ISubscriptionTransaction[]>;
  findByUserSubscriptionId(userSubscriptionId: string): Promise<ISubscriptionTransaction[]>;
  findAll(): Promise<ISubscriptionTransaction[]>;
  update(updateData: IUpdateSubscriptionTransaction): Promise<ISubscriptionTransaction>;
  delete(id: string): Promise<void>;
}

export const SUBSCRIPTION_TRANSACTION_REPOSITORY_TOKEN = new Token<ISubscriptionTransactionRepository>("ISubscriptionTransactionRepository");
