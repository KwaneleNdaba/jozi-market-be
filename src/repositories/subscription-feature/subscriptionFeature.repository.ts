import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  type ISubscriptionFeatureRepository,
  SUBSCRIPTION_FEATURE_REPOSITORY_TOKEN,
} from "@/interfaces/subscription-feature/ISubscriptionFeatureRepository.interface";
import SubscriptionFeature from "@/models/subscription-feature/subscriptionFeature.model";
import type { ISubscriptionFeature, ICreateSubscriptionFeature, IUpdateSubscriptionFeature } from "@/types/subscription.types";

@Service({ id: SUBSCRIPTION_FEATURE_REPOSITORY_TOKEN })
export class SubscriptionFeatureRepository implements ISubscriptionFeatureRepository {
  public async create(featureData: ICreateSubscriptionFeature): Promise<ISubscriptionFeature> {
    try {
      const createdFeature = await SubscriptionFeature.create({
        ...featureData,
        isIncluded: featureData.isIncluded ?? true,
      } as any, {
        raw: false,
      });

      return createdFeature.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<ISubscriptionFeature | null> {
    try {
      const feature = await SubscriptionFeature.findByPk(id, { raw: true });
      return feature;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findBySubscriptionPlanId(planId: string): Promise<ISubscriptionFeature[]> {
    try {
      const features = await SubscriptionFeature.findAll({
        where: { subscriptionPlanId: planId },
        raw: true,
        order: [["createdAt", "ASC"]],
      });

      return features;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByFeatureId(featureId: string): Promise<ISubscriptionFeature[]> {
    try {
      const features = await SubscriptionFeature.findAll({
        where: { featureId },
        raw: true,
        order: [["createdAt", "ASC"]],
      });

      return features;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(): Promise<ISubscriptionFeature[]> {
    try {
      const features = await SubscriptionFeature.findAll({
        raw: true,
        order: [["createdAt", "ASC"]],
      });

      return features;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async update(updateData: IUpdateSubscriptionFeature): Promise<ISubscriptionFeature> {
    try {
      const { id, ...updateFields } = updateData;
      const feature = await SubscriptionFeature.findByPk(id);

      if (!feature) {
        throw new HttpException(404, "Subscription feature not found");
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
      const feature = await SubscriptionFeature.findByPk(id);

      if (!feature) {
        throw new HttpException(404, "Subscription feature not found");
      }

      await feature.destroy();
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async deleteBySubscriptionPlanId(planId: string): Promise<void> {
    try {
      await SubscriptionFeature.destroy({
        where: { subscriptionPlanId: planId },
      });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }
}
