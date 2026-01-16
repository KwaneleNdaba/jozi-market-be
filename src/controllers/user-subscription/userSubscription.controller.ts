import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { USER_SUBSCRIPTION_SERVICE_TOKEN } from "@/interfaces/user-subscription/IUserSubscriptionService.interface";
import type { CustomResponse } from "@/types/response.interface";
import type { IUserSubscription } from "@/types/subscription.types";
import type { RequestWithUser } from "@/types/auth.types";
import { Role } from "@/types/auth.types";

export class UserSubscriptionController {
  private readonly userSubscriptionService: any;

  constructor() {
    this.userSubscriptionService = Container.get(USER_SUBSCRIPTION_SERVICE_TOKEN);
  }

  public createSubscription = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Extract userId from authenticated user if not provided in body
      const subscriptionData = {
        ...req.body,
        userId: req.body.userId || (req.user?.id ? req.user.id : undefined),
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
      };

      if (!subscriptionData.userId) {
        throw new HttpException(400, "User ID is required");
      }

      const createdSubscription = await this.userSubscriptionService.createSubscription(subscriptionData);

      const response: CustomResponse<IUserSubscription> = {
        data: createdSubscription,
        message: "User subscription created successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getSubscriptionById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const subscription = await this.userSubscriptionService.getSubscriptionById(id);

      if (!subscription) {
        throw new HttpException(404, "User subscription not found");
      }

      const response: CustomResponse<IUserSubscription> = {
        data: subscription,
        message: "User subscription retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getSubscriptionsByUserId = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Get userId from params or authenticated user
      const requestedUserId = req.params.userId || req.user?.id;
      if (!requestedUserId) {
        throw new HttpException(400, "User ID is required");
      }

      // Authorization: Users can only see their own subscriptions, admins can see any
      if (req.user && req.user.role !== Role.ADMIN && req.user.id !== requestedUserId) {
        throw new HttpException(403, "You can only access your own subscriptions");
      }

      const { status } = req.query;
      const subscriptions = await this.userSubscriptionService.getSubscriptionsByUserId(requestedUserId, status as string);

      const response: CustomResponse<IUserSubscription[]> = {
        data: subscriptions,
        message: "User subscriptions retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getActiveSubscriptionByUserId = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Get userId from params or authenticated user
      const requestedUserId = req.params.userId || req.user?.id;
      if (!requestedUserId) {
        throw new HttpException(400, "User ID is required");
      }

      // Authorization: Users can only see their own subscriptions, admins can see any
      if (req.user && req.user.role !== Role.ADMIN && req.user.id !== requestedUserId) {
        throw new HttpException(403, "You can only access your own subscriptions");
      }

      const subscription = await this.userSubscriptionService.getActiveSubscriptionByUserId(requestedUserId);

      const response: CustomResponse<IUserSubscription | null> = {
        data: subscription,
        message: "Active subscription retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getAllSubscriptions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { status } = req.query;
      const subscriptions = await this.userSubscriptionService.getAllSubscriptions(status as string);

      const response: CustomResponse<IUserSubscription[]> = {
        data: subscriptions,
        message: "User subscriptions retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updateData = {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      };
      const updatedSubscription = await this.userSubscriptionService.updateSubscription(updateData);

      const response: CustomResponse<IUserSubscription> = {
        data: updatedSubscription,
        message: "User subscription updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.userSubscriptionService.deleteSubscription(id);

      const response: CustomResponse<null> = {
        data: null,
        message: "User subscription deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
