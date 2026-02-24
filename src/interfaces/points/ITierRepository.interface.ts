import { Token } from "typedi";
import type { ITier, ICreateTier } from "@/types/points.types";

export interface ITierRepository {
  create(data: ICreateTier): Promise<ITier>;
  findById(id: string): Promise<ITier | null>;
  findAll(): Promise<ITier[]>;
  update(id: string, data: Partial<ITier>): Promise<ITier>;
  delete(id: string): Promise<void>;
  findActiveTiers(): Promise<ITier[]>;
  findByTierLevel(tierLevel: number): Promise<ITier | null>;
  findTierForPoints(points: number): Promise<ITier | null>;
}

export const TIER_REPOSITORY_TOKEN = new Token<ITierRepository>("ITierRepository");
