import { Router } from "express";
import { PointsClaimController } from "@/controllers/points-claim/pointsClaim.controller";
import { authorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import type { Routes } from "@/types/routes.interface";

export class PointsClaimRoute implements Routes {
  public path = "/points-claim";
  public router = Router();
  public controller = new PointsClaimController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Claim specific points
    this.router.post(
      `${this.path}/claim`,
      authorizationMiddleware,
      this.controller.claimPoints
    );

    // Claim all claimable points
    this.router.post(
      `${this.path}/claim-all`,
      authorizationMiddleware,
      this.controller.claimAllPoints
    );

    // Get user's claims
    this.router.get(
      `${this.path}/user/:userId`,
      authorizationMiddleware,
      this.controller.getUserClaims
    );

    // Get claim statistics
    this.router.get(
      `${this.path}/user/:userId/stats`,
      authorizationMiddleware,
      this.controller.getClaimStats
    );

    // Get specific claim by ID
    this.router.get(
      `${this.path}/:claimId`,
      authorizationMiddleware,
      this.controller.getClaimById
    );
  }
}
