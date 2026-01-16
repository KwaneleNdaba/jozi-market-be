import { Service, Inject } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  type IFeatureService,
  FEATURE_SERVICE_TOKEN,
} from "@/interfaces/feature/IFeatureService.interface";
import {
  type IFeatureRepository,
  FEATURE_REPOSITORY_TOKEN,
} from "@/interfaces/feature/IFeatureRepository.interface";
import type { IFeature, ICreateFeature, IUpdateFeature } from "@/types/subscription.types";

@Service({ id: FEATURE_SERVICE_TOKEN })
export class FeatureService implements IFeatureService {
  constructor(
    @Inject(FEATURE_REPOSITORY_TOKEN)
    private readonly featureRepository: IFeatureRepository
  ) {}

  public async createFeature(featureData: ICreateFeature): Promise<IFeature> {
    try {
      // Check if slug already exists
      const existingFeature = await this.featureRepository.findBySlug(featureData.slug);
      if (existingFeature) {
        throw new HttpException(409, "A feature with this slug already exists");
      }

      return await this.featureRepository.create(featureData);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async getFeatureById(id: string): Promise<IFeature | null> {
    try {
      return await this.featureRepository.findById(id);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getFeatureBySlug(slug: string): Promise<IFeature | null> {
    try {
      return await this.featureRepository.findBySlug(slug);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getAllFeatures(): Promise<IFeature[]> {
    try {
      return await this.featureRepository.findAll();
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async updateFeature(updateData: IUpdateFeature): Promise<IFeature> {
    try {
      // If slug is being updated, check if it already exists
      if (updateData.slug) {
        const existingFeature = await this.featureRepository.findBySlug(updateData.slug);
        if (existingFeature && existingFeature.id !== updateData.id) {
          throw new HttpException(409, "A feature with this slug already exists");
        }
      }

      return await this.featureRepository.update(updateData);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async deleteFeature(id: string): Promise<void> {
    try {
      await this.featureRepository.delete(id);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }
}
