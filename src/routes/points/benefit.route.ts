import { Router } from "express";
import { authorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { BenefitController } from "@/controllers/points/benefit.controller";

export class BenefitRoute implements Routes {
  public path = "/points/benefit";
  public router = Router();
  public controller = new BenefitController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authorizationMiddleware, this.controller.getAll);
    this.router.get(`${this.path}/active`, authorizationMiddleware, this.controller.getActiveBenefits);
    this.router.get(`${this.path}/:id`, authorizationMiddleware, this.controller.getById);
    this.router.post(`${this.path}`, authorizationMiddleware, this.controller.create);
    this.router.put(`${this.path}/:id`, authorizationMiddleware, this.controller.update);
    this.router.put(`${this.path}/:id/activate`, authorizationMiddleware, this.controller.activateBenefit);
    this.router.put(`${this.path}/:id/deactivate`, authorizationMiddleware, this.controller.deactivateBenefit);
    this.router.delete(`${this.path}/:id`, authorizationMiddleware, this.controller.delete);
  }
}
