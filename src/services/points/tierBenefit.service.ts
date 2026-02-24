import { Inject, Service } from "typedi";
import { TIER_BENEFIT_REPOSITORY_TOKEN, type ITierBenefitRepository } from "@/interfaces/points/ITierBenefitRepository.interface";
import { TIER_BENEFIT_SERVICE_TOKEN, type ITierBenefitService } from "@/interfaces/points/ITierBenefitService.interface";
import type { ITierBenefit, ICreateTierBenefit } from "@/types/points.types";
import { HttpException } from "@/exceptions/HttpException";

@Service({ id: TIER_BENEFIT_SERVICE_TOKEN })
export class TierBenefitService implements ITierBenefitService {
  constructor(@Inject(TIER_BENEFIT_REPOSITORY_TOKEN) private readonly tierBenefitRepository: ITierBenefitRepository) {}

  public async create(data: ICreateTierBenefit): Promise<ITierBenefit> {
    try {
      return await this.tierBenefitRepository.create(data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to create tier benefit");
    }
  }

  public async findById(id: string): Promise<ITierBenefit | null> {
    try {
      return await this.tierBenefitRepository.findById(id);
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find tier benefit");
    }
  }

  public async findAll(): Promise<ITierBenefit[]> {
    try {
      return await this.tierBenefitRepository.findAll();
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to fetch tier benefits");
    }
  }

  public async update(id: string, data: Partial<ITierBenefit>): Promise<ITierBenefit> {
    try {
      const existing = await this.tierBenefitRepository.findById(id);
      if (!existing) throw new HttpException(404, "Tier benefit not found");
      return await this.tierBenefitRepository.update(id, data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to update tier benefit");
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const existing = await this.tierBenefitRepository.findById(id);
      if (!existing) throw new HttpException(404, "Tier benefit not found");
      await this.tierBenefitRepository.delete(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to delete tier benefit");
    }
  }

  public async findByTierId(tierId: string): Promise<ITierBenefit[]> {
    try {
      return await this.tierBenefitRepository.findByTierId(tierId);
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find benefits by tier");
    }
  }

  public async findActiveBenefits(tierId: string): Promise<ITierBenefit[]> {
    try {
      return await this.tierBenefitRepository.findActiveBenefits(tierId);
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find active benefits");
    }
  }

  public async findByBenefitId(benefitId: string): Promise<ITierBenefit[]> {
    try {
      return await this.tierBenefitRepository.findByBenefitId(benefitId);
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find tier benefits by benefit");
    }
  }

  public async activateBenefit(id: string): Promise<ITierBenefit> {
    try {
      const benefit = await this.tierBenefitRepository.findById(id);
      if (!benefit) throw new HttpException(404, "Tier benefit not found");
      return await this.tierBenefitRepository.update(id, { active: true });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to activate benefit");
    }
  }

  public async deactivateBenefit(id: string): Promise<ITierBenefit> {
    try {
      const benefit = await this.tierBenefitRepository.findById(id);
      if (!benefit) throw new HttpException(404, "Tier benefit not found");
      return await this.tierBenefitRepository.update(id, { active: false });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to deactivate benefit");
    }
  }
}

