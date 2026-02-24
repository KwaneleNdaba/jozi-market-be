import { Token } from "typedi";
import type { IReferralSlotReward, ICreateReferralSlotReward } from "@/types/points.types";

export interface IReferralSlotRewardService {
  create(data: ICreateReferralSlotReward): Promise<IReferralSlotReward>;
  findById(id: string): Promise<IReferralSlotReward | null>;
  findAll(): Promise<IReferralSlotReward[]>;
  update(id: string, data: Partial<IReferralSlotReward>): Promise<IReferralSlotReward>;
  delete(id: string): Promise<void>;
  findByRewardConfigId(rewardConfigId: string): Promise<IReferralSlotReward[]>;
  findActiveSlotRewards(): Promise<IReferralSlotReward[]>;
  findActiveSlotsByConfig(rewardConfigId: string): Promise<IReferralSlotReward[]>;
  findBySlotNumber(slotNumber: number, rewardConfigId: string): Promise<IReferralSlotReward | null>;
  validateSlotNumber(slotNumber: number, rewardConfigId: string, excludeId?: string): Promise<void>;
  activateSlotReward(id: string): Promise<IReferralSlotReward>;
  deactivateSlotReward(id: string): Promise<IReferralSlotReward>;
  updateQuantity(id: string, quantity: number): Promise<IReferralSlotReward>;
  findNextAvailableSlot(rewardConfigId: string): Promise<number>;
}

export const REFERRAL_SLOT_REWARD_SERVICE_TOKEN = new Token<IReferralSlotRewardService>("IReferralSlotRewardService");
