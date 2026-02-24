import { Router } from "express";
import { authorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { AbuseFlagController } from "@/controllers/points/abuseFlag.controller";

export class AbuseFlagRoute implements Routes {
  public path = "/abuse-flags";
  public router = Router();
  public controller = new AbuseFlagController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authorizationMiddleware, this.controller.getAll);
    this.router.get(`${this.path}/pending`, authorizationMiddleware, this.controller.getPendingFlags);
    this.router.get(`${this.path}/user/:userId`, authorizationMiddleware, this.controller.getByUserId);
    this.router.get(`${this.path}/user/:userId/active`, authorizationMiddleware, this.controller.getActiveFlagsForUser);
    this.router.get(`${this.path}/type/:flagType`, authorizationMiddleware, this.controller.getByFlagType);
    this.router.get(`${this.path}/status/:status`, authorizationMiddleware, this.controller.getByStatus);
    this.router.get(`${this.path}/severity/:severity`, authorizationMiddleware, this.controller.getBySeverity);
    this.router.get(`${this.path}/ip/:ipAddress`, authorizationMiddleware, this.controller.getByIpAddress);
    this.router.get(`${this.path}/device/:deviceFingerprint`, authorizationMiddleware, this.controller.getByDeviceFingerprint);
    this.router.get(`${this.path}/:id`, authorizationMiddleware, this.controller.getById);
    this.router.post(`${this.path}`, authorizationMiddleware, this.controller.create);
    this.router.post(`${this.path}/validate`, authorizationMiddleware, this.controller.validateFlagDetails);
    this.router.put(`${this.path}/:id`, authorizationMiddleware, this.controller.update);
    this.router.put(`${this.path}/:id/review`, authorizationMiddleware, this.controller.reviewFlag);
    this.router.put(`${this.path}/:id/resolve`, authorizationMiddleware, this.controller.resolveFlag);
    this.router.put(`${this.path}/:id/dismiss`, authorizationMiddleware, this.controller.dismissFlag);
    this.router.put(`${this.path}/:id/status`, authorizationMiddleware, this.controller.updateStatus);
    this.router.delete(`${this.path}/:id`, authorizationMiddleware, this.controller.delete);
  }
}
