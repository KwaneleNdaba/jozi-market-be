import { Token } from "typedi";
import type { IFeature, ICreateFeature, IUpdateFeature } from "@/types/subscription.types";

export interface IFeatureService {
  createFeature(featureData: ICreateFeature): Promise<IFeature>;
  getFeatureById(id: string): Promise<IFeature | null>;
  getFeatureBySlug(slug: string): Promise<IFeature | null>;
  getAllFeatures(): Promise<IFeature[]>;
  updateFeature(updateData: IUpdateFeature): Promise<IFeature>;
  deleteFeature(id: string): Promise<void>;
}

export const FEATURE_SERVICE_TOKEN = new Token<IFeatureService>("IFeatureService");
