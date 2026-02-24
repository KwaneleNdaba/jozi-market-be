import { Token } from "typedi";
import type { IExpiryRule, ICreateExpiryRule, ExpiryType } from "@/types/points.types";

export interface IExpiryRuleRepository {
  create(data: ICreateExpiryRule): Promise<IExpiryRule>;
  findById(id: string): Promise<IExpiryRule | null>;
  findAll(): Promise<IExpiryRule[]>;
  update(id: string, data: Partial<IExpiryRule>): Promise<IExpiryRule>;
  delete(id: string): Promise<void>;
  findByExpiryType(expiryType: ExpiryType): Promise<IExpiryRule | null>;
}

export const EXPIRY_RULE_REPOSITORY_TOKEN = new Token<IExpiryRuleRepository>("IExpiryRuleRepository");
