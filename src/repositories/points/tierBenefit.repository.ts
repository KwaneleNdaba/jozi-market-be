import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  TIER_BENEFIT_REPOSITORY_TOKEN,
  type ITierBenefitRepository,
} from "@/interfaces/points/ITierBenefitRepository.interface";
import TierBenefit from "@/models/tier-benefit/tierBenefit.model";
import type { ITierBenefit, ICreateTierBenefit } from "@/types/points.types";

@Service({ id: TIER_BENEFIT_REPOSITORY_TOKEN })
export class TierBenefitRepository implements ITierBenefitRepository {
  public async create(data: ICreateTierBenefit): Promise<ITierBenefit> {
    try {
      const tierBenefit = await TierBenefit.create(data as any, { raw: false });
      return tierBenefit.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<ITierBenefit | null> {
    try {
      return (await TierBenefit.findOne({ where: { id }, raw: true })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(): Promise<ITierBenefit[]> {
    try {
      return (await TierBenefit.findAll({ order: [["createdAt", "DESC"]], raw: true })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async update(id: string, data: Partial<ITierBenefit>): Promise<ITierBenefit> {
    try {
      const tierBenefit = await TierBenefit.findOne({ where: { id }, raw: false });
      if (!tierBenefit) throw new HttpException(404, "TierBenefit not found");
      await tierBenefit.update(data);
      return tierBenefit.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(409, error.message);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const tierBenefit = await TierBenefit.findOne({ where: { id } });
      if (!tierBenefit) throw new HttpException(404, "TierBenefit not found");
      await tierBenefit.destroy();
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(409, error.message);
    }
  }

  public async findByTierId(tierId: string): Promise<ITierBenefit[]> {
    try {
      return (await TierBenefit.findAll({ where: { tierId }, order: [["createdAt", "DESC"]], raw: true })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findActiveBenefits(tierId: string): Promise<ITierBenefit[]> {
    try {
      return (await TierBenefit.findAll({ where: { tierId, active: true }, order: [["createdAt", "DESC"]], raw: true })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByBenefitId(benefitId: string): Promise<ITierBenefit[]> {
    try {
      return (await TierBenefit.findAll({ where: { benefitId }, order: [["createdAt", "DESC"]], raw: true })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }
}
