import { Token } from "typedi";
import type { IEarningRule, ICreateEarningRule, SourceType } from "@/types/points.types";

export interface IEarningRuleService {
  create(data: ICreateEarningRule): Promise<IEarningRule>;
  findById(id: string): Promise<IEarningRule | null>;
  findAll(): Promise<IEarningRule[]>;
  update(id: string, data: Partial<IEarningRule>): Promise<IEarningRule>;
  delete(id: string): Promise<void>;
  
  findEnabledRules(): Promise<IEarningRule[]>;
  findBySourceType(sourceType: SourceType): Promise<IEarningRule[]>;
  findByExpiryRule(expiryRuleId: string): Promise<IEarningRule[]>;
  enableRule(id: string): Promise<IEarningRule>;
  disableRule(id: string): Promise<IEarningRule>;
}

export const EARNING_RULE_SERVICE_TOKEN = new Token<IEarningRuleService>("IEarningRuleService");
