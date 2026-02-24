import { Router } from "express";
import { authorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { ReferralSlotRewardController } from "@/controllers/points/referralSlotReward.controller";

export class ReferralSlotRewardRoute implements Routes {
  public path = "/points/referral-slot-rewards";
  public router = Router();
  public controller = new ReferralSlotRewardController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authorizationMiddleware, this.controller.getAll);
    this.router.get(`${this.path}/active`, authorizationMiddleware, this.controller.getActiveSlotRewards);
    this.router.get(`${this.path}/config/:rewardConfigId`, authorizationMiddleware, this.controller.getByRewardConfigId);
    this.router.get(`${this.path}/config/:rewardConfigId/active`, authorizationMiddleware, this.controller.getActiveSlotsByConfig);
    this.router.get(`${this.path}/config/:rewardConfigId/slot/:slotNumber`, authorizationMiddleware, this.controller.getBySlotNumber);
    this.router.get(`${this.path}/config/:rewardConfigId/next-slot`, authorizationMiddleware, this.controller.getNextAvailableSlot);
    this.router.get(`${this.path}/:id`, authorizationMiddleware, this.controller.getById);
    this.router.post(`${this.path}`, authorizationMiddleware, this.controller.create);
    this.router.post(`${this.path}/config/:rewardConfigId/validate-slot/:slotNumber`, authorizationMiddleware, this.controller.validateSlotNumber);
    this.router.put(`${this.path}/:id`, authorizationMiddleware, this.controller.update);
    this.router.put(`${this.path}/:id/quantity`, authorizationMiddleware, this.controller.updateQuantity);
    this.router.put(`${this.path}/:id/activate`, authorizationMiddleware, this.controller.activateSlotReward);
    this.router.put(`${this.path}/:id/deactivate`, authorizationMiddleware, this.controller.deactivateSlotReward);
    this.router.delete(`${this.path}/:id`, authorizationMiddleware, this.controller.delete);
  }
}
