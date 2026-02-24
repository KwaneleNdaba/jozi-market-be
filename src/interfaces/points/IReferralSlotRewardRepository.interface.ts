import { Token } from "typedi";
import type { IReferralSlotReward, ICreateReferralSlotReward } from "@/types/points.types";

export interface IReferralSlotRewardRepository {
  create(data: ICreateReferralSlotReward): Promise<IReferralSlotReward>;
  findById(id: string): Promise<IReferralSlotReward | null>;
  findAll(): Promise<IReferralSlotReward[]>;
  update(id: string, data: Partial<IReferralSlotReward>): Promise<IReferralSlotReward>;
  delete(id: string): Promise<void>;
  findByRewardConfigId(rewardConfigId: string): Promise<IReferralSlotReward[]>;
  findActiveSlots(): Promise<IReferralSlotReward[]>;
  findActiveSlotsByConfig(rewardConfigId: string): Promise<IReferralSlotReward[]>;
  findBySlotNumber(slotNumber: number, rewardConfigId: string): Promise<IReferralSlotReward | null>;
}

export const REFERRAL_SLOT_REWARD_REPOSITORY_TOKEN = new Token<IReferralSlotRewardRepository>("IReferralSlotRewardRepository");
