import { Router } from "express";
import { authorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { EarningRuleController } from "@/controllers/points/earningRule.controller";

export class EarningRuleRoute implements Routes {
  public path = "/points/earning-rules";
  public router = Router();
  public controller = new EarningRuleController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authorizationMiddleware, this.controller.getAll);
    this.router.get(`${this.path}/enabled`, authorizationMiddleware, this.controller.getEnabledRules);
    this.router.get(`${this.path}/source/:sourceType`, authorizationMiddleware, this.controller.getBySourceType);
    this.router.get(`${this.path}/expiry-rule/:expiryRuleId`, authorizationMiddleware, this.controller.getByExpiryRule);
    this.router.get(`${this.path}/:id`, authorizationMiddleware, this.controller.getById);
    this.router.post(`${this.path}`, authorizationMiddleware, this.controller.create);
    this.router.put(`${this.path}/:id`, authorizationMiddleware, this.controller.update);
    this.router.put(`${this.path}/:id/enable`, authorizationMiddleware, this.controller.enableRule);
    this.router.put(`${this.path}/:id/disable`, authorizationMiddleware, this.controller.disableRule);
    this.router.delete(`${this.path}/:id`, authorizationMiddleware, this.controller.delete);
  }
}
