import { Router } from "express";
import { authorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { FreeProductCampaignController } from "@/controllers/free-product-campaign/freeProductCampaign.controller";

export class FreeProductCampaignRoute implements Routes {
  public path = "/free-product-campaigns";
  public router = Router();
  public controller = new FreeProductCampaignController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authorizationMiddleware, this.controller.getAll);
    this.router.get(`${this.path}/visible`, this.controller.getVisible);
    this.router.get(`${this.path}/pending`, authorizationMiddleware, this.controller.getPending);
    this.router.get(`${this.path}/vendor/:vendorId`, authorizationMiddleware, this.controller.getByVendor);
    this.router.get(`${this.path}/product/:productId`, authorizationMiddleware, this.controller.getByProduct);
    this.router.get(`${this.path}/:id`, authorizationMiddleware, this.controller.getById);
    this.router.post(`${this.path}`, authorizationMiddleware, this.controller.create);
    this.router.put(`${this.path}/:id`, authorizationMiddleware, this.controller.update);
    this.router.put(`${this.path}/:id/approve`, authorizationMiddleware, this.controller.approve);
    this.router.put(`${this.path}/:id/reject`, authorizationMiddleware, this.controller.reject);
    this.router.put(`${this.path}/:id/visibility`, authorizationMiddleware, this.controller.setVisible);
    this.router.delete(`${this.path}/:id`, authorizationMiddleware, this.controller.delete);
  }
}
