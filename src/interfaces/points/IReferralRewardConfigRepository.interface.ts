import { Token } from "typedi";
import type { IReferralRewardConfig, ICreateReferralRewardConfig } from "@/types/points.types";

export interface IReferralRewardConfigRepository {
  create(data: ICreateReferralRewardConfig): Promise<IReferralRewardConfig>;
  findById(id: string): Promise<IReferralRewardConfig | null>;
  findAll(): Promise<IReferralRewardConfig[]>;
  update(id: string, data: Partial<IReferralRewardConfig>): Promise<IReferralRewardConfig>;
  delete(id: string): Promise<void>;
  findEnabledConfig(): Promise<IReferralRewardConfig | null>;
}

export const REFERRAL_REWARD_CONFIG_REPOSITORY_TOKEN = new Token<IReferralRewardConfigRepository>("IReferralRewardConfigRepository");
