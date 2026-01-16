import { Router } from "express";
import { CreateUserSubscriptionDto, UpdateUserSubscriptionDto } from "@/dots/user-subscription/userSubscription.dot";
import { adminAuthorizationMiddleware, vendorAuthorizationMiddleware, authorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import { ValidationMiddleware } from "@/middlewares/ValidationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { UserSubscriptionController } from "../../controllers/user-subscription/userSubscription.controller";

export class UserSubscriptionRoute implements Routes {
  public path = "/user-subscription";
  public router = Router();
  public userSubscription = new UserSubscriptionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create user subscription (vendor/admin only)
    this.router.post(
      `${this.path}`,
      vendorAuthorizationMiddleware,
      ValidationMiddleware(CreateUserSubscriptionDto),
      this.userSubscription.createSubscription
    );

    // Get active subscription by user ID (authenticated)
    // IMPORTANT: This route must come before /user/:userId to avoid route conflicts
    this.router.get(
      `${this.path}/active/user/:userId`,
      authorizationMiddleware,
      this.userSubscription.getActiveSubscriptionByUserId
    );

    // Get subscriptions by user ID (authenticated)
    // IMPORTANT: This route must come before /:id to avoid route conflicts
    this.router.get(
      `${this.path}/user/:userId`,
      authorizationMiddleware,
      this.userSubscription.getSubscriptionsByUserId
    );

    // Get user subscription by ID (authenticated)
    this.router.get(
      `${this.path}/:id`,
      authorizationMiddleware,
      this.userSubscription.getSubscriptionById
    );

    // Get all user subscriptions with optional status filter (admin only)
    this.router.get(
      "/user-subscriptions",
      adminAuthorizationMiddleware,
      this.userSubscription.getAllSubscriptions
    );

    // Update user subscription (admin only)
    this.router.put(
      `${this.path}`,
      adminAuthorizationMiddleware,
      ValidationMiddleware(UpdateUserSubscriptionDto),
      this.userSubscription.updateSubscription
    );

    // Delete user subscription (admin only)
    this.router.delete(
      `${this.path}/:id`,
      adminAuthorizationMiddleware,
      this.userSubscription.deleteSubscription
    );
  }
}
