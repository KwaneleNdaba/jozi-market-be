import { Token } from "typedi";
import type { IUserSubscription, ICreateUserSubscription, IUpdateUserSubscription } from "@/types/subscription.types";

export interface IUserSubscriptionService {
  createSubscription(subscriptionData: ICreateUserSubscription): Promise<IUserSubscription>;
  getSubscriptionById(id: string): Promise<IUserSubscription | null>;
  getSubscriptionsByUserId(userId: string, status?: string): Promise<IUserSubscription[]>;
  getActiveSubscriptionByUserId(userId: string): Promise<IUserSubscription | null>;
  getAllSubscriptions(status?: string): Promise<IUserSubscription[]>;
  updateSubscription(updateData: IUpdateUserSubscription): Promise<IUserSubscription>;
  deleteSubscription(id: string): Promise<void>;
}

export const USER_SUBSCRIPTION_SERVICE_TOKEN = new Token<IUserSubscriptionService>("IUserSubscriptionService");
