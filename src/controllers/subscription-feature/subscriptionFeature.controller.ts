import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { SUBSCRIPTION_FEATURE_SERVICE_TOKEN } from "@/interfaces/subscription-feature/ISubscriptionFeatureService.interface";
import type { CustomResponse } from "@/types/response.interface";
import type { ISubscriptionFeature } from "@/types/subscription.types";

export class SubscriptionFeatureController {
  private readonly subscriptionFeatureService: any;

  constructor() {
    this.subscriptionFeatureService = Container.get(SUBSCRIPTION_FEATURE_SERVICE_TOKEN);
  }

  public createSubscriptionFeature = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const featureData = req.body;
      const createdFeature = await this.subscriptionFeatureService.createSubscriptionFeature(featureData);

      const response: CustomResponse<ISubscriptionFeature> = {
        data: createdFeature,
        message: "Subscription feature created successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getSubscriptionFeatureById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const feature = await this.subscriptionFeatureService.getSubscriptionFeatureById(id);

      if (!feature) {
        throw new HttpException(404, "Subscription feature not found");
      }

      const response: CustomResponse<ISubscriptionFeature> = {
        data: feature,
        message: "Subscription feature retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getFeaturesBySubscriptionPlanId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { planId } = req.params;
      const features = await this.subscriptionFeatureService.getFeaturesBySubscriptionPlanId(planId);

      const response: CustomResponse<ISubscriptionFeature[]> = {
        data: features,
        message: "Subscription features retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getAllSubscriptionFeatures = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const features = await this.subscriptionFeatureService.getAllSubscriptionFeatures();

      const response: CustomResponse<ISubscriptionFeature[]> = {
        data: features,
        message: "Subscription features retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateSubscriptionFeature = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updateData = req.body;
      const updatedFeature = await this.subscriptionFeatureService.updateSubscriptionFeature(updateData);

      const response: CustomResponse<ISubscriptionFeature> = {
        data: updatedFeature,
        message: "Subscription feature updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteSubscriptionFeature = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.subscriptionFeatureService.deleteSubscriptionFeature(id);

      const response: CustomResponse<null> = {
        data: null,
        message: "Subscription feature deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
