import { Router } from "express";
import {
  CreateReturnDto,
  ReviewReturnDto,
  ReviewReturnItemDto,
  UpdateReturnStatusDto,
  UpdateReturnItemStatusDto,
} from "@/dots/return/return.dot";
import { authorizationMiddleware, adminAuthorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import { ValidationMiddleware } from "@/middlewares/ValidationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { ReturnController } from "../../controllers/return/return.controller";

export class ReturnRoute implements Routes {
  public path = "/return";
  public router = Router();
  public return = new ReturnController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create return request (authenticated users only)
    this.router.post(
      `${this.path}`,
      authorizationMiddleware,
      ValidationMiddleware(CreateReturnDto),
      this.return.createReturn
    );

    // Get my returns (authenticated users only) - MUST come before /:id route
    this.router.get(
      `${this.path}/my-returns`,
      authorizationMiddleware,
      this.return.getMyReturns
    );

    // Get all returns (admin only) - MUST come before /:id route
    this.router.get(
      `${this.path}`,
      adminAuthorizationMiddleware,
      this.return.getAllReturns
    );

    // Review return request (admin only) - MUST come before /:id route
    this.router.put(
      `${this.path}/review`,
      adminAuthorizationMiddleware,
      ValidationMiddleware(ReviewReturnDto),
      this.return.reviewReturn
    );

    // Review return item request (admin only) - MUST come before /:id route
    this.router.put(
      `${this.path}/item/review`,
      adminAuthorizationMiddleware,
      ValidationMiddleware(ReviewReturnItemDto),
      this.return.reviewReturnItem
    );

    // Update return status (admin only) - MUST come before /:id route
    this.router.put(
      `${this.path}/:returnId/status`,
      adminAuthorizationMiddleware,
      ValidationMiddleware(UpdateReturnStatusDto),
      this.return.updateReturnStatus
    );

    // Update return item status (admin only) - MUST come before /:id route
    this.router.put(
      `${this.path}/item/:returnItemId/status`,
      adminAuthorizationMiddleware,
      ValidationMiddleware(UpdateReturnItemStatusDto),
      this.return.updateReturnItemStatus
    );

    // Cancel return (authenticated users only) - MUST come before /:id route
    this.router.put(
      `${this.path}/:returnId/cancel`,
      authorizationMiddleware,
      this.return.cancelReturn
    );

    // Get return by ID (authenticated users only - can access own returns)
    // This must come AFTER all specific routes
    this.router.get(
      `${this.path}/:id`,
      authorizationMiddleware,
      this.return.getReturnById
    );
  }
}
