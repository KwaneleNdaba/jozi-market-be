import { Inject, Service } from "typedi";
import { BENEFIT_REPOSITORY_TOKEN, type IBenefitRepository } from "@/interfaces/points/IBenefitRepository.interface";
import { BENEFIT_SERVICE_TOKEN, type IBenefitService } from "@/interfaces/points/IBenefitService.interface";
import type { IBenefit, ICreateBenefit } from "@/types/points.types";
import { HttpException } from "@/exceptions/HttpException";

@Service({ id: BENEFIT_SERVICE_TOKEN })
export class BenefitService implements IBenefitService {
  constructor(@Inject(BENEFIT_REPOSITORY_TOKEN) private readonly benefitRepository: IBenefitRepository) {}

  public async create(data: ICreateBenefit): Promise<IBenefit> {
    try {
      return await this.benefitRepository.create(data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to create benefit");
    }
  }

  public async findById(id: string): Promise<IBenefit | null> {
    try {
      return await this.benefitRepository.findById(id);
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find benefit");
    }
  }

  public async findAll(): Promise<IBenefit[]> {
    try {
      return await this.benefitRepository.findAll();
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to fetch benefits");
    }
  }

  public async update(id: string, data: Partial<IBenefit>): Promise<IBenefit> {
    try {
      const existing = await this.benefitRepository.findById(id);
      if (!existing) throw new HttpException(404, "Benefit not found");
      return await this.benefitRepository.update(id, data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to update benefit");
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const existing = await this.benefitRepository.findById(id);
      if (!existing) throw new HttpException(404, "Benefit not found");
      await this.benefitRepository.delete(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to delete benefit");
    }
  }

  public async findActiveBenefits(): Promise<IBenefit[]> {
    try {
      return await this.benefitRepository.findActiveBenefits();
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find active benefits");
    }
  }

  public async activateBenefit(id: string): Promise<IBenefit> {
    try {
      const benefit = await this.benefitRepository.findById(id);
      if (!benefit) throw new HttpException(404, "Benefit not found");
      return await this.benefitRepository.update(id, { active: true });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to activate benefit");
    }
  }

  public async deactivateBenefit(id: string): Promise<IBenefit> {
    try {
      const benefit = await this.benefitRepository.findById(id);
      if (!benefit) throw new HttpException(404, "Benefit not found");
      return await this.benefitRepository.update(id, { active: false });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to deactivate benefit");
    }
  }
}
