import { Token } from "typedi";
import type { ISubscriptionPlan, ICreateSubscriptionPlan, IUpdateSubscriptionPlan } from "@/types/subscription.types";

export interface ISubscriptionPlanRepository {
  create(planData: ICreateSubscriptionPlan): Promise<ISubscriptionPlan>;
  findById(id: string): Promise<ISubscriptionPlan | null>;
  findAll(status?: string): Promise<ISubscriptionPlan[]>;
  update(updateData: IUpdateSubscriptionPlan): Promise<ISubscriptionPlan>;
  delete(id: string): Promise<void>;
}

export const SUBSCRIPTION_PLAN_REPOSITORY_TOKEN = new Token<ISubscriptionPlanRepository>("ISubscriptionPlanRepository");
