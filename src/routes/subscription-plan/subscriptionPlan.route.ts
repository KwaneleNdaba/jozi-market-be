import { Router } from "express";
import { CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto } from "@/dots/subscription-plan/subscriptionPlan.dot";
import { adminAuthorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import { ValidationMiddleware } from "@/middlewares/ValidationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { SubscriptionPlanController } from "../../controllers/subscription-plan/subscriptionPlan.controller";

export class SubscriptionPlanRoute implements Routes {
  public path = "/subscription-plan";
  public router = Router();
  public subscriptionPlan = new SubscriptionPlanController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create subscription plan (admin only)
    this.router.post(
      `${this.path}`,
      adminAuthorizationMiddleware,
      ValidationMiddleware(CreateSubscriptionPlanDto),
      this.subscriptionPlan.createPlan
    );

    // Get subscription plan by ID (public)
    this.router.get(
      `${this.path}/:id`,
      this.subscriptionPlan.getPlanById
    );

    // Get all subscription plans with optional status filter (public)
    this.router.get(
      "/subscription-plans",
      this.subscriptionPlan.getAllPlans
    );

    // Update subscription plan (admin only)
    this.router.put(
      `${this.path}`,
      adminAuthorizationMiddleware,
      ValidationMiddleware(UpdateSubscriptionPlanDto),
      this.subscriptionPlan.updatePlan
    );

    // Delete subscription plan (admin only)
    this.router.delete(
      `${this.path}/:id`,
      adminAuthorizationMiddleware,
      this.subscriptionPlan.deletePlan
    );
  }
}
