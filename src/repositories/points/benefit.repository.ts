import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  BENEFIT_REPOSITORY_TOKEN,
  type IBenefitRepository,
} from "@/interfaces/points/IBenefitRepository.interface";
import Benefit from "@/models/benefit/benefit.model";
import type { IBenefit, ICreateBenefit } from "@/types/points.types";

@Service({ id: BENEFIT_REPOSITORY_TOKEN })
export class BenefitRepository implements IBenefitRepository {
  public async create(data: ICreateBenefit): Promise<IBenefit> {
    try {
      const benefit = await Benefit.create(data as any, { raw: false });
      return benefit.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<IBenefit | null> {
    try {
      return (await Benefit.findOne({ where: { id }, raw: true })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(): Promise<IBenefit[]> {
    try {
      return (await Benefit.findAll({ order: [["createdAt", "DESC"]], raw: true })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async update(id: string, data: Partial<IBenefit>): Promise<IBenefit> {
    try {
      const benefit = await Benefit.findOne({ where: { id }, raw: false });
      if (!benefit) throw new HttpException(404, "Benefit not found");
      await benefit.update(data);
      return benefit.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(409, error.message);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const benefit = await Benefit.findOne({ where: { id } });
      if (!benefit) throw new HttpException(404, "Benefit not found");
      await benefit.destroy();
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(409, error.message);
    }
  }

  public async findActiveBenefits(): Promise<IBenefit[]> {
    try {
      return (await Benefit.findAll({ where: { active: true }, order: [["createdAt", "DESC"]], raw: true })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }
}
