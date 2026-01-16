import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { SUBSCRIPTION_PLAN_SERVICE_TOKEN } from "@/interfaces/subscription-plan/ISubscriptionPlanService.interface";
import type { CustomResponse } from "@/types/response.interface";
import type { ISubscriptionPlan } from "@/types/subscription.types";

export class SubscriptionPlanController {
  private readonly subscriptionPlanService: any;

  constructor() {
    this.subscriptionPlanService = Container.get(SUBSCRIPTION_PLAN_SERVICE_TOKEN);
  }

  public createPlan = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const planData = req.body;
      const createdPlan = await this.subscriptionPlanService.createPlan(planData);

      const response: CustomResponse<ISubscriptionPlan> = {
        data: createdPlan,
        message: "Subscription plan created successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getPlanById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const plan = await this.subscriptionPlanService.getPlanById(id);

      if (!plan) {
        throw new HttpException(404, "Subscription plan not found");
      }

      const response: CustomResponse<ISubscriptionPlan> = {
        data: plan,
        message: "Subscription plan retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getAllPlans = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { status } = req.query;
      const plans = await this.subscriptionPlanService.getAllPlans(status as string);

      const response: CustomResponse<ISubscriptionPlan[]> = {
        data: plans,
        message: "Subscription plans retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updatePlan = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updateData = req.body;
      const updatedPlan = await this.subscriptionPlanService.updatePlan(updateData);

      const response: CustomResponse<ISubscriptionPlan> = {
        data: updatedPlan,
        message: "Subscription plan updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deletePlan = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.subscriptionPlanService.deletePlan(id);

      const response: CustomResponse<null> = {
        data: null,
        message: "Subscription plan deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
