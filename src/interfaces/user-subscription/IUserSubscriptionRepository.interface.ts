import { Token } from "typedi";
import type { IUserSubscription, ICreateUserSubscription, IUpdateUserSubscription } from "@/types/subscription.types";

export interface IUserSubscriptionRepository {
  create(subscriptionData: ICreateUserSubscription): Promise<IUserSubscription>;
  findById(id: string): Promise<IUserSubscription | null>;
  findByUserId(userId: string, status?: string): Promise<IUserSubscription[]>;
  findActiveByUserId(userId: string): Promise<IUserSubscription | null>;
  findAll(status?: string): Promise<IUserSubscription[]>;
  update(updateData: IUpdateUserSubscription): Promise<IUserSubscription>;
  delete(id: string): Promise<void>;
}

export const USER_SUBSCRIPTION_REPOSITORY_TOKEN = new Token<IUserSubscriptionRepository>("IUserSubscriptionRepository");
