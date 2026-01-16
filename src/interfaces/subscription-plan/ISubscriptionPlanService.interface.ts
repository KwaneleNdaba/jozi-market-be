import { Token } from "typedi";
import type { ISubscriptionPlan, ICreateSubscriptionPlan, IUpdateSubscriptionPlan } from "@/types/subscription.types";

export interface ISubscriptionPlanService {
  createPlan(planData: ICreateSubscriptionPlan): Promise<ISubscriptionPlan>;
  getPlanById(id: string): Promise<ISubscriptionPlan | null>;
  getAllPlans(status?: string): Promise<ISubscriptionPlan[]>;
  updatePlan(updateData: IUpdateSubscriptionPlan): Promise<ISubscriptionPlan>;
  deletePlan(id: string): Promise<void>;
}

export const SUBSCRIPTION_PLAN_SERVICE_TOKEN = new Token<ISubscriptionPlanService>("ISubscriptionPlanService");
