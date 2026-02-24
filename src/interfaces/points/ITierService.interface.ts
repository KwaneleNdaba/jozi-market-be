import { Token } from "typedi";
import type { ITier, ICreateTier } from "@/types/points.types";

export interface ITierService {
  create(data: ICreateTier): Promise<ITier>;
  findById(id: string): Promise<ITier | null>;
  findAll(): Promise<ITier[]>;
  update(id: string, data: Partial<ITier>): Promise<ITier>;
  delete(id: string): Promise<void>;
  
  findActiveTiers(): Promise<ITier[]>;
  findByLevel(tierLevel: number): Promise<ITier | null>;
  findTierByPoints(points: number): Promise<ITier | null>;
  validateTierHierarchy(data: ICreateTier | Partial<ITier>): Promise<void>;
  activateTier(id: string): Promise<ITier>;
  deactivateTier(id: string): Promise<ITier>;
  reorderTiers(tierIds: string[]): Promise<ITier[]>;
}

export const TIER_SERVICE_TOKEN = new Token<ITierService>("ITierService");
