import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  REFERRAL_SLOT_REWARD_REPOSITORY_TOKEN,
  type IReferralSlotRewardRepository,
} from "@/interfaces/points/IReferralSlotRewardRepository.interface";
import ReferralSlotReward from "@/models/referral-slot-reward/referralSlotReward.model";
import type { IReferralSlotReward, ICreateReferralSlotReward } from "@/types/points.types";

@Service({ id: REFERRAL_SLOT_REWARD_REPOSITORY_TOKEN })
export class ReferralSlotRewardRepository implements IReferralSlotRewardRepository {
  public async create(data: ICreateReferralSlotReward): Promise<IReferralSlotReward> {
    try {
      const slotReward = await ReferralSlotReward.create(data as any, { raw: false });
      return slotReward.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<IReferralSlotReward | null> {
    try {
      return (await ReferralSlotReward.findOne({
        where: { id },
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(): Promise<IReferralSlotReward[]> {
    try {
      return (await ReferralSlotReward.findAll({
        order: [["createdAt", "DESC"]],
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async update(id: string, data: Partial<IReferralSlotReward>): Promise<IReferralSlotReward> {
    try {
      const slotReward = await ReferralSlotReward.findOne({
        where: { id },
        raw: false,
      });

      if (!slotReward) {
        throw new HttpException(404, "ReferralSlotReward not found");
      }

      await slotReward.update(data);
      return slotReward.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const slotReward = await ReferralSlotReward.findOne({
        where: { id },
      });

      if (!slotReward) {
        throw new HttpException(404, "ReferralSlotReward not found");
      }

      await slotReward.destroy();
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async findActiveSlots(): Promise<IReferralSlotReward[]> {
    try {
      return (await ReferralSlotReward.findAll({
        where: { active: true },
        order: [["slotNumber", "ASC"]],
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findActiveSlotsByConfig(rewardConfigId: string): Promise<IReferralSlotReward[]> {
    try {
      return (await ReferralSlotReward.findAll({
        where: { rewardConfigId, active: true },
        order: [["slotNumber", "ASC"]],
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByRewardConfigId(rewardConfigId: string): Promise<IReferralSlotReward[]> {
    try {
      return (await ReferralSlotReward.findAll({
        where: { rewardConfigId },
        order: [["slotNumber", "ASC"]],
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findBySlotNumber(slotNumber: number, rewardConfigId: string): Promise<IReferralSlotReward | null> {
    try {
      return (await ReferralSlotReward.findOne({
        where: { slotNumber, rewardConfigId },
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }
}
