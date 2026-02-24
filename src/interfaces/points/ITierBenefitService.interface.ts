import { Token } from "typedi";
import type { ITierBenefit, ICreateTierBenefit } from "@/types/points.types";

export interface ITierBenefitService {
  create(data: ICreateTierBenefit): Promise<ITierBenefit>;
  findById(id: string): Promise<ITierBenefit | null>;
  findAll(): Promise<ITierBenefit[]>;
  update(id: string, data: Partial<ITierBenefit>): Promise<ITierBenefit>;
  delete(id: string): Promise<void>;
  findByTierId(tierId: string): Promise<ITierBenefit[]>;
  findActiveBenefits(tierId: string): Promise<ITierBenefit[]>;
  findByBenefitId(benefitId: string): Promise<ITierBenefit[]>;
  activateBenefit(id: string): Promise<ITierBenefit>;
  deactivateBenefit(id: string): Promise<ITierBenefit>;
}

export const TIER_BENEFIT_SERVICE_TOKEN = new Token<ITierBenefitService>("ITierBenefitService");
