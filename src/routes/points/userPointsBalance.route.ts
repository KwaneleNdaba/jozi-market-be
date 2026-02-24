import { Router } from "express";
import { authorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { UserPointsBalanceController } from "@/controllers/points/userPointsBalance.controller";

export class UserPointsBalanceRoute implements Routes {
  public path = "/user-points-balance";
  public router = Router();
  public controller = new UserPointsBalanceController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/user/:userId`, authorizationMiddleware, this.controller.getBalance);
  }
}
