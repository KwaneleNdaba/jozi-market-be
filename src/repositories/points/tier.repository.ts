import { Service } from "typedi";
import { Op } from "sequelize";
import { HttpException } from "@/exceptions/HttpException";
import {
  TIER_REPOSITORY_TOKEN,
  type ITierRepository,
} from "@/interfaces/points/ITierRepository.interface";
import Tier from "@/models/tier/tier.model";
import type { ITier, ICreateTier } from "@/types/points.types";

@Service({ id: TIER_REPOSITORY_TOKEN })
export class TierRepository implements ITierRepository {
  public async create(data: ICreateTier): Promise<ITier> {
    try {
      const tier = await Tier.create(data as any, { raw: false });
      return tier.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<ITier | null> {
    try {
      return (await Tier.findOne({
        where: { id },
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(): Promise<ITier[]> {
    try {
      return (await Tier.findAll({
        order: [["createdAt", "DESC"]],
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async update(id: string, data: Partial<ITier>): Promise<ITier> {
    try {
      const tier = await Tier.findOne({
        where: { id },
        raw: false,
      });

      if (!tier) {
        throw new HttpException(404, "Tier not found");
      }

      await tier.update(data);
      return tier.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const tier = await Tier.findOne({
        where: { id },
      });

      if (!tier) {
        throw new HttpException(404, "Tier not found");
      }

      await tier.destroy();
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async findActiveTiers(): Promise<ITier[]> {
    try {
      return (await Tier.findAll({
        where: { 
          active: true,
        },
        order: [["tierLevel", "ASC"]],
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByTierLevel(tierLevel: number): Promise<ITier | null> {
    try {
      return (await Tier.findOne({
        where: { 
          tierLevel,
        },
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findTierForPoints(points: number): Promise<ITier | null> {
    try {
      return (await Tier.findOne({
        where: { 
          minPoints: { [Op.lte]: points },
          active: true,
        },
        order: [["minPoints", "DESC"]],
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }
}
