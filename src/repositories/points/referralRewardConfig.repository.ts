import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  REFERRAL_REWARD_CONFIG_REPOSITORY_TOKEN,
  type IReferralRewardConfigRepository,
} from "@/interfaces/points/IReferralRewardConfigRepository.interface";
import ReferralRewardConfig from "@/models/referral-reward-config/referralRewardConfig.model";
import ReferralSlotReward from "@/models/referral-slot-reward/referralSlotReward.model";
import type { IReferralRewardConfig, ICreateReferralRewardConfig } from "@/types/points.types";

@Service({ id: REFERRAL_REWARD_CONFIG_REPOSITORY_TOKEN })
export class ReferralRewardConfigRepository implements IReferralRewardConfigRepository {
  public async create(data: ICreateReferralRewardConfig): Promise<IReferralRewardConfig> {
    try {
      const config = await ReferralRewardConfig.create(data as any, { raw: false });
      return config.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<IReferralRewardConfig | null> {
    try {
      const result = await ReferralRewardConfig.findOne({
        where: { id },
        include: [{ model: ReferralSlotReward, as: "slotRewards", order: [["slotNumber", "ASC"]] }],
      });
      return result ? (result.get({ plain: true }) as any) : null;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(): Promise<IReferralRewardConfig[]> {
    try {
      const results = await ReferralRewardConfig.findAll({
        include: [{ model: ReferralSlotReward, as: "slotRewards", order: [["slotNumber", "ASC"]] }],
        order: [["createdAt", "DESC"]],
      });
      return results.map(r => r.get({ plain: true })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async update(id: string, data: Partial<IReferralRewardConfig>): Promise<IReferralRewardConfig> {
    try {
      const config = await ReferralRewardConfig.findOne({
        where: { id },
        raw: false,
      });

      if (!config) {
        throw new HttpException(404, "ReferralRewardConfig not found");
      }

      await config.update(data);
      return config.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const config = await ReferralRewardConfig.findOne({
        where: { id },
      });

      if (!config) {
        throw new HttpException(404, "ReferralRewardConfig not found");
      }

      await config.destroy();
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async findEnabledConfig(): Promise<IReferralRewardConfig | null> {
    try {
      return (await ReferralRewardConfig.findOne({
        where: { enabled: true },
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }
}
