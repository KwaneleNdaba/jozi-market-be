import { Service, Inject } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  type ISubscriptionFeatureService,
  SUBSCRIPTION_FEATURE_SERVICE_TOKEN,
} from "@/interfaces/subscription-feature/ISubscriptionFeatureService.interface";
import {
  type ISubscriptionFeatureRepository,
  SUBSCRIPTION_FEATURE_REPOSITORY_TOKEN,
} from "@/interfaces/subscription-feature/ISubscriptionFeatureRepository.interface";
import type { ISubscriptionFeature, ICreateSubscriptionFeature, IUpdateSubscriptionFeature } from "@/types/subscription.types";

@Service({ id: SUBSCRIPTION_FEATURE_SERVICE_TOKEN })
export class SubscriptionFeatureService implements ISubscriptionFeatureService {
  constructor(
    @Inject(SUBSCRIPTION_FEATURE_REPOSITORY_TOKEN)
    private readonly subscriptionFeatureRepository: ISubscriptionFeatureRepository
  ) {}

  public async createSubscriptionFeature(featureData: ICreateSubscriptionFeature): Promise<ISubscriptionFeature> {
    try {
      return await this.subscriptionFeatureRepository.create(featureData);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async getSubscriptionFeatureById(id: string): Promise<ISubscriptionFeature | null> {
    try {
      return await this.subscriptionFeatureRepository.findById(id);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getFeaturesBySubscriptionPlanId(planId: string): Promise<ISubscriptionFeature[]> {
    try {
      return await this.subscriptionFeatureRepository.findBySubscriptionPlanId(planId);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getAllSubscriptionFeatures(): Promise<ISubscriptionFeature[]> {
    try {
      return await this.subscriptionFeatureRepository.findAll();
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async updateSubscriptionFeature(updateData: IUpdateSubscriptionFeature): Promise<ISubscriptionFeature> {
    try {
      return await this.subscriptionFeatureRepository.update(updateData);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async deleteSubscriptionFeature(id: string): Promise<void> {
    try {
      await this.subscriptionFeatureRepository.delete(id);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async deleteFeaturesBySubscriptionPlanId(planId: string): Promise<void> {
    try {
      await this.subscriptionFeatureRepository.deleteBySubscriptionPlanId(planId);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }
}
