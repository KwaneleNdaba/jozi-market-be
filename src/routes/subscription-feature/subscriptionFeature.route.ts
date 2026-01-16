import { Router } from "express";
import { CreateSubscriptionFeatureDto, UpdateSubscriptionFeatureDto } from "@/dots/subscription-feature/subscriptionFeature.dot";
import { adminAuthorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import { ValidationMiddleware } from "@/middlewares/ValidationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { SubscriptionFeatureController } from "../../controllers/subscription-feature/subscriptionFeature.controller";

export class SubscriptionFeatureRoute implements Routes {
  public path = "/subscription-feature";
  public router = Router();
  public subscriptionFeature = new SubscriptionFeatureController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create subscription feature (admin only)
    this.router.post(
      `${this.path}`,
      adminAuthorizationMiddleware,
      ValidationMiddleware(CreateSubscriptionFeatureDto),
      this.subscriptionFeature.createSubscriptionFeature
    );

    // Get features by subscription plan ID (public)
    // IMPORTANT: This route must come before /:id to avoid route conflicts
    this.router.get(
      `${this.path}/plan/:planId`,
      this.subscriptionFeature.getFeaturesBySubscriptionPlanId
    );

    // Get subscription feature by ID (public)
    this.router.get(
      `${this.path}/:id`,
      this.subscriptionFeature.getSubscriptionFeatureById
    );

    // Get all subscription features (public)
    this.router.get(
      "/subscription-features",
      this.subscriptionFeature.getAllSubscriptionFeatures
    );

    // Update subscription feature (admin only)
    this.router.put(
      `${this.path}`,
      adminAuthorizationMiddleware,
      ValidationMiddleware(UpdateSubscriptionFeatureDto),
      this.subscriptionFeature.updateSubscriptionFeature
    );

    // Delete subscription feature (admin only)
    this.router.delete(
      `${this.path}/:id`,
      adminAuthorizationMiddleware,
      this.subscriptionFeature.deleteSubscriptionFeature
    );
  }
}
