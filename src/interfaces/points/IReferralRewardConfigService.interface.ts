import { Token } from "typedi";
import type { IReferralRewardConfig, ICreateReferralRewardConfig } from "@/types/points.types";

export interface IReferralRewardConfigService {
  create(data: ICreateReferralRewardConfig): Promise<IReferralRewardConfig>;
  findById(id: string): Promise<IReferralRewardConfig | null>;
  findAll(): Promise<IReferralRewardConfig[]>;
  update(id: string, data: Partial<IReferralRewardConfig>): Promise<IReferralRewardConfig>;
  delete(id: string): Promise<void>;
  findEnabledConfigs(): Promise<IReferralRewardConfig[]>;
  enableConfig(id: string): Promise<IReferralRewardConfig>;
  disableConfig(id: string): Promise<IReferralRewardConfig>;
  validateRewardAmounts(data: ICreateReferralRewardConfig | Partial<IReferralRewardConfig>): Promise<void>;
  updateMinPurchaseAmount(id: string, amount: number): Promise<IReferralRewardConfig>;
  toggleOneRewardPerUser(id: string): Promise<IReferralRewardConfig>;
}

export const REFERRAL_REWARD_CONFIG_SERVICE_TOKEN = new Token<IReferralRewardConfigService>("IReferralRewardConfigService");
