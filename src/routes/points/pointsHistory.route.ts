import { Router } from "express";
import { authorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { PointsHistoryController } from "@/controllers/points/pointsHistory.controller";

export class PointsHistoryRoute implements Routes {
  public path = "/points-history";
  public router = Router();
  public controller = new PointsHistoryController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authorizationMiddleware, this.controller.getAll);
    this.router.get(`${this.path}/user/:userId`, authorizationMiddleware, this.controller.getByUserId);
    this.router.get(`${this.path}/:id`, authorizationMiddleware, this.controller.getById);
  }
}
