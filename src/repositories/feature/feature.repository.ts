import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  type IFeatureRepository,
  FEATURE_REPOSITORY_TOKEN,
} from "@/interfaces/feature/IFeatureRepository.interface";
import Feature from "@/models/feature/feature.model";
import type { IFeature, ICreateFeature, IUpdateFeature } from "@/types/subscription.types";

@Service({ id: FEATURE_REPOSITORY_TOKEN })
export class FeatureRepository implements IFeatureRepository {
  public async create(featureData: ICreateFeature): Promise<IFeature> {
    try {
      const createdFeature = await Feature.create(featureData as any, {
        raw: false,
      });

      return createdFeature.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<IFeature | null> {
    try {
      const feature = await Feature.findByPk(id, { raw: true });
      return feature;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findBySlug(slug: string): Promise<IFeature | null> {
    try {
      const feature = await Feature.findOne({
        where: { slug },
        raw: true,
      });
      return feature;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(): Promise<IFeature[]> {
    try {
      const features = await Feature.findAll({
        raw: true,
        order: [["createdAt", "ASC"]],
      });

      return features;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async update(updateData: IUpdateFeature): Promise<IFeature> {
    try {
      const { id, ...updateFields } = updateData;
      const feature = await Feature.findByPk(id);

      if (!feature) {
        throw new HttpException(404, "Feature not found");
      }

      await feature.update(updateFields as any);
      return feature.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const feature = await Feature.findByPk(id);

      if (!feature) {
        throw new HttpException(404, "Feature not found");
      }

      await feature.destroy();
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }
}
