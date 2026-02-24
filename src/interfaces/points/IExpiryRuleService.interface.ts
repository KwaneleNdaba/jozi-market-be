import { Token } from "typedi";
import type { IExpiryRule, ICreateExpiryRule, ExpiryType, ExpiryMode } from "@/types/points.types";

export interface IExpiryRuleService {
  create(data: ICreateExpiryRule): Promise<IExpiryRule>;
  findById(id: string): Promise<IExpiryRule | null>;
  findAll(): Promise<IExpiryRule[]>;
  update(id: string, data: Partial<IExpiryRule>): Promise<IExpiryRule>;
  delete(id: string): Promise<void>;
  
  findByExpiryType(expiryType: ExpiryType): Promise<IExpiryRule[]>;
  findByExpiryMode(expiryMode: ExpiryMode): Promise<IExpiryRule[]>;
  validateExpirySettings(data: ICreateExpiryRule | Partial<IExpiryRule>): Promise<void>;
  activateRule(id: string): Promise<IExpiryRule>;
  deactivateRule(id: string): Promise<IExpiryRule>;
  toggleNotifications(id: string): Promise<IExpiryRule>;
  calculateExpiryDate(ruleId: string, earnedDate: Date): Promise<Date>;
}

export const EXPIRY_RULE_SERVICE_TOKEN = new Token<IExpiryRuleService>("IExpiryRuleService");
