import { Token } from "typedi";
import type { IEarningRule, ICreateEarningRule, SourceType } from "@/types/points.types";

export interface IEarningRuleRepository {
  create(data: ICreateEarningRule): Promise<IEarningRule>;
  findById(id: string): Promise<IEarningRule | null>;
  findAll(): Promise<IEarningRule[]>;
  update(id: string, data: Partial<IEarningRule>): Promise<IEarningRule>;
  delete(id: string): Promise<void>;
  findEnabledRules(): Promise<IEarningRule[]>;
  findBySourceType(sourceType: SourceType): Promise<IEarningRule[]>;
  findByExpiryRule(expiryRuleId: string): Promise<IEarningRule[]>;
}

export const EARNING_RULE_REPOSITORY_TOKEN = new Token<IEarningRuleRepository>("IEarningRuleRepository");
