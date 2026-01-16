import { Token } from "typedi";
import type { ISubscriptionFeature, ICreateSubscriptionFeature, IUpdateSubscriptionFeature } from "@/types/subscription.types";

export interface ISubscriptionFeatureService {
  createSubscriptionFeature(featureData: ICreateSubscriptionFeature): Promise<ISubscriptionFeature>;
  getSubscriptionFeatureById(id: string): Promise<ISubscriptionFeature | null>;
  getFeaturesBySubscriptionPlanId(planId: string): Promise<ISubscriptionFeature[]>;
  getAllSubscriptionFeatures(): Promise<ISubscriptionFeature[]>;
  updateSubscriptionFeature(updateData: IUpdateSubscriptionFeature): Promise<ISubscriptionFeature>;
  deleteSubscriptionFeature(id: string): Promise<void>;
  deleteFeaturesBySubscriptionPlanId(planId: string): Promise<void>;
}

export const SUBSCRIPTION_FEATURE_SERVICE_TOKEN = new Token<ISubscriptionFeatureService>("ISubscriptionFeatureService");
