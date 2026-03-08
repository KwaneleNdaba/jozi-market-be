import { Router } from "express";
import { authorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { CampaignClaimController } from "@/controllers/campaign-claim/campaignClaim.controller";

export class CampaignClaimRoute implements Routes {
  public path = "/campaign-claims";
  public router = Router();
  public controller = new CampaignClaimController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Authenticated user routes
    this.router.post(`${this.path}`, authorizationMiddleware, this.controller.claim);
    this.router.get(`${this.path}/my`, authorizationMiddleware, this.controller.getMyClaims);
    this.router.patch(`${this.path}/:id/cancel`, authorizationMiddleware, this.controller.cancel);

    // Admin / vendor routes
    this.router.get(`${this.path}`, authorizationMiddleware, this.controller.getAll);
    this.router.get(`${this.path}/:id`, authorizationMiddleware, this.controller.getById);
    this.router.get(`${this.path}/campaign/:campaignId`, authorizationMiddleware, this.controller.getByCampaignId);
    this.router.patch(`${this.path}/:id/fulfill`, authorizationMiddleware, this.controller.fulfill);
  }
}
