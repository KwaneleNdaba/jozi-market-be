import { Inject, Service } from "typedi";
import { REFERRAL_REWARD_CONFIG_REPOSITORY_TOKEN, type IReferralRewardConfigRepository } from "@/interfaces/points/IReferralRewardConfigRepository.interface";
import { REFERRAL_REWARD_CONFIG_SERVICE_TOKEN, type IReferralRewardConfigService } from "@/interfaces/points/IReferralRewardConfigService.interface";
import type { IReferralRewardConfig, ICreateReferralRewardConfig } from "@/types/points.types";
import { HttpException } from "@/exceptions/HttpException";

@Service({ id: REFERRAL_REWARD_CONFIG_SERVICE_TOKEN })
export class ReferralRewardConfigService implements IReferralRewardConfigService {
  constructor(@Inject(REFERRAL_REWARD_CONFIG_REPOSITORY_TOKEN) private readonly referralRewardConfigRepository: IReferralRewardConfigRepository) {}

  public async create(data: ICreateReferralRewardConfig): Promise<IReferralRewardConfig> {
    try {
      await this.validateRewardAmounts(data);
      return await this.referralRewardConfigRepository.create(data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to create referral reward configuration");
    }
  }

  public async findById(id: string): Promise<IReferralRewardConfig | null> {
    try {
      return await this.referralRewardConfigRepository.findById(id);
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find referral reward configuration");
    }
  }

  public async findAll(): Promise<IReferralRewardConfig[]> {
    try {
      return await this.referralRewardConfigRepository.findAll();
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to fetch referral reward configurations");
    }
  }

  public async update(id: string, data: Partial<IReferralRewardConfig>): Promise<IReferralRewardConfig> {
    try {
      const existing = await this.referralRewardConfigRepository.findById(id);
      if (!existing) {
        throw new HttpException(404, "Referral reward configuration not found");
      }

      if (data.signupPoints !== undefined || data.firstPurchasePoints !== undefined) {
        await this.validateRewardAmounts({ ...existing, ...data } as ICreateReferralRewardConfig);
      }

      return await this.referralRewardConfigRepository.update(id, data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to update referral reward configuration");
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const existing = await this.referralRewardConfigRepository.findById(id);
      if (!existing) {
        throw new HttpException(404, "Referral reward configuration not found");
      }

      await this.referralRewardConfigRepository.delete(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to delete referral reward configuration");
    }
  }

  public async findEnabledConfigs(): Promise<IReferralRewardConfig[]> {
    try {
      const allConfigs = await this.referralRewardConfigRepository.findAll();
      return allConfigs.filter(config => config.enabled);
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find enabled configurations");
    }
  }

  public async enableConfig(id: string): Promise<IReferralRewardConfig> {
    try {
      const config = await this.referralRewardConfigRepository.findById(id);
      if (!config) {
        throw new HttpException(404, "Referral reward configuration not found");
      }

      return await this.referralRewardConfigRepository.update(id, { enabled: true });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to enable configuration");
    }
  }

  public async disableConfig(id: string): Promise<IReferralRewardConfig> {
    try {
      const config = await this.referralRewardConfigRepository.findById(id);
      if (!config) {
        throw new HttpException(404, "Referral reward configuration not found");
      }

      return await this.referralRewardConfigRepository.update(id, { enabled: false });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to disable configuration");
    }
  }

  public async validateRewardAmounts(data: ICreateReferralRewardConfig | Partial<IReferralRewardConfig>): Promise<void> {
    if (data.signupPoints !== undefined && data.signupPoints < 0) {
      throw new HttpException(400, "Signup points cannot be negative");
    }

    if (data.firstPurchasePoints !== undefined && data.firstPurchasePoints < 0) {
      throw new HttpException(400, "First purchase points cannot be negative");
    }

    if (data.minPurchaseAmount !== undefined && data.minPurchaseAmount < 0) {
      throw new HttpException(400, "Minimum purchase amount cannot be negative");
    }
  }

  public async updateMinPurchaseAmount(id: string, amount: number): Promise<IReferralRewardConfig> {
    try {
      const config = await this.referralRewardConfigRepository.findById(id);
      if (!config) {
        throw new HttpException(404, "Referral reward configuration not found");
      }

      if (amount < 0) {
        throw new HttpException(400, "Minimum purchase amount cannot be negative");
      }

      return await this.referralRewardConfigRepository.update(id, { minPurchaseAmount: amount });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to update minimum purchase amount");
    }
  }

  public async toggleOneRewardPerUser(id: string): Promise<IReferralRewardConfig> {
    try {
      const config = await this.referralRewardConfigRepository.findById(id);
      if (!config) {
        throw new HttpException(404, "Referral reward configuration not found");
      }

      return await this.referralRewardConfigRepository.update(id, { oneRewardPerReferredUser: !config.oneRewardPerReferredUser });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to toggle one reward per user");
    }
  }
}
