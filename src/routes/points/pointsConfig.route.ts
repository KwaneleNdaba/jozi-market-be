import { Router } from "express";
import { adminAuthorizationMiddleware, authorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { PointsConfigController } from "@/controllers/points/pointsConfig.controller";

export class PointsConfigRoute implements Routes {
  public path = "/points/points-config";
  public router = Router();
  public controller = new PointsConfigController();

  constructor() {
    this.initializeRoutes();
  }

    private initializeRoutes() {
      this.router.get(`${this.path}`, adminAuthorizationMiddleware, this.controller.getAll);
      this.router.get(`${this.path}/active`, adminAuthorizationMiddleware, this.controller.getActiveConfig);
      this.router.get(`${this.path}/history`, adminAuthorizationMiddleware, this.controller.getConfigHistory);
      this.router.get(`${this.path}/version/:version`, adminAuthorizationMiddleware, this.controller.getByVersion);
      this.router.get(`${this.path}/:id`, adminAuthorizationMiddleware, this.controller.getById);
      this.router.post(`${this.path}`, adminAuthorizationMiddleware, this.controller.create);
      this.router.post(`${this.path}/validate`, adminAuthorizationMiddleware, this.controller.validateConfigRules);
      this.router.post(`${this.path}/:id/clone`, adminAuthorizationMiddleware, this.controller.cloneConfig);
      this.router.put(`${this.path}/:id`, adminAuthorizationMiddleware, this.controller.update);
      this.router.put(`${this.path}/:id/activate`, adminAuthorizationMiddleware, this.controller.activateConfig);
      this.router.put(`${this.path}/:id/deactivate`, adminAuthorizationMiddleware, this.controller.deactivateConfig);
      this.router.delete(`${this.path}/:id`, adminAuthorizationMiddleware, this.controller.delete);
    }
  }

