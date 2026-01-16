import { Token } from "typedi";
import type { ISubscriptionFeature, ICreateSubscriptionFeature, IUpdateSubscriptionFeature } from "@/types/subscription.types";

export interface ISubscriptionFeatureRepository {
  create(featureData: ICreateSubscriptionFeature): Promise<ISubscriptionFeature>;
  findById(id: string): Promise<ISubscriptionFeature | null>;
  findBySubscriptionPlanId(planId: string): Promise<ISubscriptionFeature[]>;
  findByFeatureId(featureId: string): Promise<ISubscriptionFeature[]>;
  findAll(): Promise<ISubscriptionFeature[]>;
  update(updateData: IUpdateSubscriptionFeature): Promise<ISubscriptionFeature>;
  delete(id: string): Promise<void>;
  deleteBySubscriptionPlanId(planId: string): Promise<void>;
}

export const SUBSCRIPTION_FEATURE_REPOSITORY_TOKEN = new Token<ISubscriptionFeatureRepository>("ISubscriptionFeatureRepository");
