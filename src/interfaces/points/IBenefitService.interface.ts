import { Token } from "typedi";
import type { IBenefit, ICreateBenefit } from "@/types/points.types";

export interface IBenefitService {
  create(data: ICreateBenefit): Promise<IBenefit>;
  findById(id: string): Promise<IBenefit | null>;
  findAll(): Promise<IBenefit[]>;
  update(id: string, data: Partial<IBenefit>): Promise<IBenefit>;
  delete(id: string): Promise<void>;
  findActiveBenefits(): Promise<IBenefit[]>;
  activateBenefit(id: string): Promise<IBenefit>;
  deactivateBenefit(id: string): Promise<IBenefit>;
}

export const BENEFIT_SERVICE_TOKEN = new Token<IBenefitService>("IBenefitService");
