import { Router } from "express";
import {
  CreateVendorApplicationDto,
  UpdateVendorApplicationStatusDto,
} from "@/dots/vendor-application/vendorApplication.dot";
import {
  AdminAuthorizationMiddleware,
  adminAuthorizationMiddleware,
  adminOrVendorAuthorizationMiddleware,
  authorizationMiddleware,
} from "@/middlewares/authorizationMiddleware";
import { ValidationMiddleware } from "@/middlewares/ValidationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { VendorController } from "../../controllers/vendor-application/vendor.controller";

export class VendorRoute implements Routes {
  public path = "/vendor";
  public router = Router();
  public vendor = new VendorController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create vendor application (public endpoint)
    this.router.post(
      `${this.path}/application`,
      ValidationMiddleware(CreateVendorApplicationDto),
      this.vendor.createApplication
    );

    // Get application by ID (public, but can be protected if needed)
    this.router.get(
      `${this.path}/application/:id`,
      adminAuthorizationMiddleware,
      this.vendor.getApplicationById
    );

    // Get application by user ID (protected)
    this.router.get(
      `${this.path}/application/user/:userId`,
      adminOrVendorAuthorizationMiddleware,
      this.vendor.getApplicationByUserId
    );

    // Get all applications with optional status filter (admin only)
    this.router.get(
      `${this.path}/applications`,
      adminAuthorizationMiddleware,
      this.vendor.getAllApplications
    );

    // Update application status (admin only)
    this.router.put(
      `${this.path}/application/status`,
      adminAuthorizationMiddleware,
      ValidationMiddleware(UpdateVendorApplicationStatusDto),
      this.vendor.updateApplicationStatus
    );

    // Delete application (admin only)
    this.router.delete(
      `${this.path}/application/:id`,
      adminAuthorizationMiddleware,
      this.vendor.deleteApplication
    );
  }
}
