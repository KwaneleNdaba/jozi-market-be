import { Token } from "typedi";
import type { IFeature, ICreateFeature, IUpdateFeature } from "@/types/subscription.types";

export interface IFeatureRepository {
  create(featureData: ICreateFeature): Promise<IFeature>;
  findById(id: string): Promise<IFeature | null>;
  findBySlug(slug: string): Promise<IFeature | null>;
  findAll(): Promise<IFeature[]>;
  update(updateData: IUpdateFeature): Promise<IFeature>;
  delete(id: string): Promise<void>;
}

export const FEATURE_REPOSITORY_TOKEN = new Token<IFeatureRepository>("IFeatureRepository");
