import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { FEATURE_SERVICE_TOKEN } from "@/interfaces/feature/IFeatureService.interface";
import type { CustomResponse } from "@/types/response.interface";
import type { IFeature } from "@/types/subscription.types";

export class FeatureController {
  private readonly featureService: any;

  constructor() {
    this.featureService = Container.get(FEATURE_SERVICE_TOKEN);
  }

  public createFeature = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const featureData = req.body;
      const createdFeature = await this.featureService.createFeature(featureData);

      const response: CustomResponse<IFeature> = {
        data: createdFeature,
        message: "Feature created successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getFeatureById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const feature = await this.featureService.getFeatureById(id);

      if (!feature) {
        throw new HttpException(404, "Feature not found");
      }

      const response: CustomResponse<IFeature> = {
        data: feature,
        message: "Feature retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getFeatureBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { slug } = req.params;
      const feature = await this.featureService.getFeatureBySlug(slug);

      if (!feature) {
        throw new HttpException(404, "Feature not found");
      }

      const response: CustomResponse<IFeature> = {
        data: feature,
        message: "Feature retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getAllFeatures = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const features = await this.featureService.getAllFeatures();

      const response: CustomResponse<IFeature[]> = {
        data: features,
        message: "Features retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateFeature = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updateData = req.body;
      const updatedFeature = await this.featureService.updateFeature(updateData);

      const response: CustomResponse<IFeature> = {
        data: updatedFeature,
        message: "Feature updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteFeature = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.featureService.deleteFeature(id);

      const response: CustomResponse<null> = {
        data: null,
        message: "Feature deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
