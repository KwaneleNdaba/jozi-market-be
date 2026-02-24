import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  POINTS_CONFIG_REPOSITORY_TOKEN,
  type IPointsConfigRepository,
} from "@/interfaces/points/IPointsConfigRepository.interface";
import PointsConfig from "@/models/points-config/pointsConfig.model";
import type { IPointsConfig, ICreatePointsConfig } from "@/types/points.types";

@Service({ id: POINTS_CONFIG_REPOSITORY_TOKEN })
export class PointsConfigRepository implements IPointsConfigRepository {
  public async create(data: ICreatePointsConfig): Promise<IPointsConfig> {
    try {
      const config = await PointsConfig.create(data as any, { raw: false });
      return config.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<IPointsConfig | null> {
    try {
      return (await PointsConfig.findOne({
        where: { id },
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(): Promise<IPointsConfig[]> {
    try {
      return (await PointsConfig.findAll({
        order: [["createdAt", "DESC"]],
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async update(id: string, data: Partial<IPointsConfig>): Promise<IPointsConfig> {
    try {
      const config = await PointsConfig.findOne({
        where: { id },
        raw: false,
      });

      if (!config) {
        throw new HttpException(404, "PointsConfig not found");
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
      const config = await PointsConfig.findOne({
        where: { id },
      });

      if (!config) {
        throw new HttpException(404, "PointsConfig not found");
      }

      await config.destroy();
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async findActiveConfig(): Promise<IPointsConfig | null> {
    try {
      return (await PointsConfig.findOne({
        where: { isActive: true },
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByVersion(version: number): Promise<IPointsConfig | null> {
    try {
      return (await PointsConfig.findOne({
        where: { version },
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async activateConfig(id: string, userId: string): Promise<IPointsConfig> {
    try {
      await PointsConfig.update(
        { isActive: false },
        { where: { isActive: true } }
      );

      const config = await PointsConfig.findOne({
        where: { id },
        raw: false,
      });

      if (!config) {
        throw new HttpException(404, "PointsConfig not found");
      }

      await config.update({
        isActive: true,
        activatedBy: userId,
        activatedAt: new Date(),
      });

      return config.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async deactivateConfig(id: string): Promise<IPointsConfig> {
    try {
      const config = await PointsConfig.findOne({
        where: { id },
        raw: false,
      });

      if (!config) {
        throw new HttpException(404, "PointsConfig not found");
      }

      await config.update({
        isActive: false,
        deactivatedAt: new Date(),
      });

      return config.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }
}
