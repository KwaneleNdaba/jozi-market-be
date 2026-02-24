import { Router } from "express";
import { authorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { TierController } from "@/controllers/points/tier.controller";

export class TierRoute implements Routes {
  public path = "/points/tier";
  public router = Router();
  public controller = new TierController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authorizationMiddleware, this.controller.getAll);
    this.router.get(`${this.path}/active`, authorizationMiddleware, this.controller.getActiveTiers);
    this.router.get(`${this.path}/level/:tierLevel`, authorizationMiddleware, this.controller.getByLevel);
    this.router.get(`${this.path}/points/:points`, authorizationMiddleware, this.controller.getTierByPoints);
    this.router.get(`${this.path}/:id`, authorizationMiddleware, this.controller.getById);
    this.router.post(`${this.path}`, authorizationMiddleware, this.controller.create);
    this.router.post(`${this.path}/validate`, authorizationMiddleware, this.controller.validateTierHierarchy);
    this.router.post(`${this.path}/reorder`, authorizationMiddleware, this.controller.reorderTiers);
    this.router.put(`${this.path}/:id`, authorizationMiddleware, this.controller.update);
    this.router.put(`${this.path}/:id/activate`, authorizationMiddleware, this.controller.activateTier);
    this.router.put(`${this.path}/:id/deactivate`, authorizationMiddleware, this.controller.deactivateTier);
    this.router.delete(`${this.path}/:id`, authorizationMiddleware, this.controller.delete);
  }
}
