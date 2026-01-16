import { Router } from "express";
import { CreateFeatureDto, UpdateFeatureDto } from "@/dots/feature/feature.dot";
import { adminAuthorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import { ValidationMiddleware } from "@/middlewares/ValidationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { FeatureController } from "../../controllers/feature/feature.controller";

export class FeatureRoute implements Routes {
  public path = "/feature";
  public router = Router();
  public feature = new FeatureController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create feature (admin only)
    this.router.post(
      `${this.path}`,
      adminAuthorizationMiddleware,
      ValidationMiddleware(CreateFeatureDto),
      this.feature.createFeature
    );

    // Get feature by slug (public)
    // IMPORTANT: This route must come before /:id to avoid route conflicts
    this.router.get(
      `${this.path}/slug/:slug`,
      this.feature.getFeatureBySlug
    );

    // Get feature by ID (public)
    this.router.get(
      `${this.path}/:id`,
      this.feature.getFeatureById
    );

    // Get all features (public)
    this.router.get(
      "/features",
      this.feature.getAllFeatures
    );

    // Update feature (admin only)
    this.router.put(
      `${this.path}`,
      adminAuthorizationMiddleware,
      ValidationMiddleware(UpdateFeatureDto),
      this.feature.updateFeature
    );

    // Delete feature (admin only)
    this.router.delete(
      `${this.path}/:id`,
      adminAuthorizationMiddleware,
      this.feature.deleteFeature
    );
  }
}
