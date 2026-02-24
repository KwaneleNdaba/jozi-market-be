import { Router } from "express";
import { authorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { ExpiryRuleController } from "@/controllers/points/expiryRule.controller";

export class ExpiryRuleRoute implements Routes {
  public path = "/points/expiry-rules";
  public router = Router();
  public controller = new ExpiryRuleController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authorizationMiddleware, this.controller.getAll);
    this.router.get(`${this.path}/type/:expiryType`, authorizationMiddleware, this.controller.getByExpiryType);
    this.router.get(`${this.path}/mode/:expiryMode`, authorizationMiddleware, this.controller.getByExpiryMode);
    this.router.get(`${this.path}/:id`, authorizationMiddleware, this.controller.getById);
    this.router.post(`${this.path}`, authorizationMiddleware, this.controller.create);
    this.router.post(`${this.path}/validate`, authorizationMiddleware, this.controller.validateExpirySettings);
    this.router.post(`${this.path}/:ruleId/calculate-expiry`, authorizationMiddleware, this.controller.calculateExpiryDate);
    this.router.put(`${this.path}/:id`, authorizationMiddleware, this.controller.update);
    this.router.put(`${this.path}/:id/activate`, authorizationMiddleware, this.controller.activateRule);
    this.router.put(`${this.path}/:id/deactivate`, authorizationMiddleware, this.controller.deactivateRule);
    this.router.put(`${this.path}/:id/toggle-notifications`, authorizationMiddleware, this.controller.toggleNotifications);
    this.router.delete(`${this.path}/:id`, authorizationMiddleware, this.controller.delete);
  }
}
