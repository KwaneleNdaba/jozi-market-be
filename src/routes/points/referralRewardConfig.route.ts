import { Router } from "express";
import { authorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { ReferralRewardConfigController } from "@/controllers/points/referralRewardConfig.controller";

export class ReferralRewardConfigRoute implements Routes {
  public path = "/points/referral-reward-configs";
  public router = Router();
  public controller = new ReferralRewardConfigController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authorizationMiddleware, this.controller.getAll);
    this.router.get(`${this.path}/enabled`, authorizationMiddleware, this.controller.getEnabledConfigs);
    this.router.get(`${this.path}/:id`, authorizationMiddleware, this.controller.getById);
    this.router.post(`${this.path}`, authorizationMiddleware, this.controller.create);
    this.router.post(`${this.path}/validate`, authorizationMiddleware, this.controller.validateRewardAmounts);
    this.router.put(`${this.path}/:id`, authorizationMiddleware, this.controller.update);
    this.router.put(`${this.path}/:id/enable`, authorizationMiddleware, this.controller.enableConfig);
    this.router.put(`${this.path}/:id/disable`, authorizationMiddleware, this.controller.disableConfig);
    this.router.put(`${this.path}/:id/min-purchase`, authorizationMiddleware, this.controller.updateMinPurchaseAmount);
    this.router.put(`${this.path}/:id/toggle-one-reward`, authorizationMiddleware, this.controller.toggleOneRewardPerUser);
    this.router.delete(`${this.path}/:id`, authorizationMiddleware, this.controller.delete);
  }
}
