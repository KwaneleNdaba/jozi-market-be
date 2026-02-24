import { Token } from "typedi";
import type { IBenefit, ICreateBenefit } from "@/types/points.types";

export interface IBenefitRepository {
  create(data: ICreateBenefit): Promise<IBenefit>;
  findById(id: string): Promise<IBenefit | null>;
  findAll(): Promise<IBenefit[]>;
  update(id: string, data: Partial<IBenefit>): Promise<IBenefit>;
  delete(id: string): Promise<void>;
  findActiveBenefits(): Promise<IBenefit[]>;
}

export const BENEFIT_REPOSITORY_TOKEN = new Token<IBenefitRepository>("IBenefitRepository");
