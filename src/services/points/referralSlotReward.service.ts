

import { Inject, Service } from "typedi";
import { REFERRAL_SLOT_REWARD_REPOSITORY_TOKEN, type IReferralSlotRewardRepository } from "@/interfaces/points/IReferralSlotRewardRepository.interface";
import { REFERRAL_SLOT_REWARD_SERVICE_TOKEN, type IReferralSlotRewardService } from "@/interfaces/points/IReferralSlotRewardService.interface";
import type { IReferralSlotReward, ICreateReferralSlotReward } from "@/types/points.types";
import { HttpException } from "@/exceptions/HttpException";
import { getDownloadSignedUrl } from "@/utils/s3";
import { logger } from "@/utils/logger";

@Service({ id: REFERRAL_SLOT_REWARD_SERVICE_TOKEN })
export class ReferralSlotRewardService implements IReferralSlotRewardService {
  constructor(@Inject(REFERRAL_SLOT_REWARD_REPOSITORY_TOKEN) private readonly referralSlotRewardRepository: IReferralSlotRewardRepository) {}

  private extractS3Key(fileUrl: string): string {
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      const urlWithoutQuery = fileUrl.split('?')[0];
      const urlParts = urlWithoutQuery.split('/');
      const keyIndex = urlParts.findIndex(part => part === 'jozi-makert-files');
      if (keyIndex !== -1) {
        return urlParts.slice(keyIndex).join('/');
      }
      return `jozi-makert-files/${urlParts[urlParts.length - 1]}`;
    } else if (fileUrl.startsWith('jozi-makert-files/')) {
      return fileUrl;
    }
    return `jozi-makert-files/${fileUrl}`;
  }

  private async enrichWithSignedUrl(slot: IReferralSlotReward): Promise<IReferralSlotReward> {
    if (!slot.fileUrl) return slot;
    try {
      const s3Key = this.extractS3Key(slot.fileUrl);
      const signedUrl = await getDownloadSignedUrl(s3Key, undefined, 3600);
      return { ...slot, fileUrl: signedUrl };
    } catch (error) {
      logger.error(`Failed to generate signed URL for slot reward file:`, error);
      return slot;
    }
  }

  public async create(data: ICreateReferralSlotReward): Promise<IReferralSlotReward> {
    try {
      await this.validateSlotNumber(data.slotNumber, data.rewardConfigId);
      const normalized = data.fileUrl ? { ...data, fileUrl: this.extractS3Key(data.fileUrl) } : data;
      const result = await this.referralSlotRewardRepository.create(normalized);
      return this.enrichWithSignedUrl(result);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to create referral slot reward");
    }
  }

  public async findById(id: string): Promise<IReferralSlotReward | null> {
    try {
      const result = await this.referralSlotRewardRepository.findById(id);
      return result ? await this.enrichWithSignedUrl(result) : null;
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find referral slot reward");
    }
  }

  public async findAll(): Promise<IReferralSlotReward[]> {
    try {
      const results = await this.referralSlotRewardRepository.findAll();
      return Promise.all(results.map(s => this.enrichWithSignedUrl(s)));
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to fetch referral slot rewards");
    }
  }

  public async update(id: string, data: Partial<IReferralSlotReward>): Promise<IReferralSlotReward> {
    try {
      const existing = await this.referralSlotRewardRepository.findById(id);
      if (!existing) {
        throw new HttpException(404, "Referral slot reward not found");
      }

      if (data.slotNumber !== undefined && data.slotNumber !== existing.slotNumber) {
        await this.validateSlotNumber(data.slotNumber, existing.rewardConfigId, id);
      }

      const normalized = data.fileUrl ? { ...data, fileUrl: this.extractS3Key(data.fileUrl) } : data;
      const result = await this.referralSlotRewardRepository.update(id, normalized);
      return this.enrichWithSignedUrl(result);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to update referral slot reward");
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const existing = await this.referralSlotRewardRepository.findById(id);
      if (!existing) {
        throw new HttpException(404, "Referral slot reward not found");
      }

      await this.referralSlotRewardRepository.delete(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to delete referral slot reward");
    }
  }

  public async findActiveSlotRewards(): Promise<IReferralSlotReward[]> {
    try {
      const results = await this.referralSlotRewardRepository.findActiveSlots();
      return Promise.all(results.map(s => this.enrichWithSignedUrl(s)));
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find active slot rewards");
    }
  }

  public async findActiveSlotsByConfig(rewardConfigId: string): Promise<IReferralSlotReward[]> {
    try {
      const results = await this.referralSlotRewardRepository.findActiveSlotsByConfig(rewardConfigId);
      return Promise.all(results.map(s => this.enrichWithSignedUrl(s)));
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find active slots by config");
    }
  }

  public async findByRewardConfigId(rewardConfigId: string): Promise<IReferralSlotReward[]> {
    try {
      const results = await this.referralSlotRewardRepository.findByRewardConfigId(rewardConfigId);
      return Promise.all(results.map(s => this.enrichWithSignedUrl(s)));
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find slot rewards by config");
    }
  }

  public async findBySlotNumber(slotNumber: number, rewardConfigId: string): Promise<IReferralSlotReward | null> {
    try {
      const result = await this.referralSlotRewardRepository.findBySlotNumber(slotNumber, rewardConfigId);
      return result ? await this.enrichWithSignedUrl(result) : null;
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find slot reward by number");
    }
  }

  public async validateSlotNumber(slotNumber: number, rewardConfigId: string, excludeId?: string): Promise<void> {
    if (slotNumber < 1) {
      throw new HttpException(400, "Slot number must be at least 1");
    }

    const existing = await this.referralSlotRewardRepository.findBySlotNumber(slotNumber, rewardConfigId);
    if (existing && existing.id !== excludeId) {
      throw new HttpException(400, `Slot number ${slotNumber} already exists for this config`);
    }
  }

  public async activateSlotReward(id: string): Promise<IReferralSlotReward> {
    try {
      const slotReward = await this.referralSlotRewardRepository.findById(id);
      if (!slotReward) {
        throw new HttpException(404, "Referral slot reward not found");
      }

      return this.enrichWithSignedUrl(await this.referralSlotRewardRepository.update(id, { active: true }));
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to activate slot reward");
    }
  }

  public async deactivateSlotReward(id: string): Promise<IReferralSlotReward> {
    try {
      const slotReward = await this.referralSlotRewardRepository.findById(id);
      if (!slotReward) {
        throw new HttpException(404, "Referral slot reward not found");
      }

      return this.enrichWithSignedUrl(await this.referralSlotRewardRepository.update(id, { active: false }));
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to deactivate slot reward");
    }
  }

  public async updateQuantity(id: string, quantity: number): Promise<IReferralSlotReward> {
    try {
      const slotReward = await this.referralSlotRewardRepository.findById(id);
      if (!slotReward) {
        throw new HttpException(404, "Referral slot reward not found");
      }

      if (quantity < 0) {
        throw new HttpException(400, "Quantity cannot be negative");
      }

      return this.enrichWithSignedUrl(await this.referralSlotRewardRepository.update(id, { quantity }));
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to update quantity");
    }
  }

  public async findNextAvailableSlot(rewardConfigId: string): Promise<number> {
    try {
      const slots = await this.referralSlotRewardRepository.findByRewardConfigId(rewardConfigId);

      if (slots.length === 0) {
        return 1;
      }

      const maxSlot = Math.max(...slots.map(s => s.slotNumber));
      return maxSlot + 1;
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find next available slot");
    }
  }
}
