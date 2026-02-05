import { Router } from "express";
import { authorizationMiddleware, adminOrVendorAuthorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { InventoryController } from "../../controllers/inventory/inventory.controller";

export class InventoryRoute implements Routes {
  public path = "/inventory";
  public router = Router();
  public inventory = new InventoryController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get inventory by variant ID (vendor/admin)
    this.router.get(
      `${this.path}/variant/:variantId`,
      authorizationMiddleware,
      adminOrVendorAuthorizationMiddleware,
      this.inventory.getByVariantId
    );

    // Get movements for a variant (vendor/admin)
    this.router.get(
      `${this.path}/variant/:variantId/movements`,
      authorizationMiddleware,
      adminOrVendorAuthorizationMiddleware,
      this.inventory.getMovements
    );

    // Get inventory by product ID – products without variants (vendor/admin)
    this.router.get(
      `${this.path}/product/:productId`,
      authorizationMiddleware,
      adminOrVendorAuthorizationMiddleware,
      this.inventory.getByProductId
    );

    // Get movements for a product – products without variants (vendor/admin)
    this.router.get(
      `${this.path}/product/:productId/movements`,
      authorizationMiddleware,
      adminOrVendorAuthorizationMiddleware,
      this.inventory.getMovementsByProductId
    );

    // Get low-stock items by vendor ID (vendor for own, admin for any)
    this.router.get(
      `${this.path}/vendor/:vendorId/low-stock`,
      authorizationMiddleware,
      adminOrVendorAuthorizationMiddleware,
      this.inventory.getLowStock
    );

    // Record restock (vendor/admin)
    this.router.post(
      `${this.path}/restock`,
      authorizationMiddleware,
      adminOrVendorAuthorizationMiddleware,
      this.inventory.restock
    );

    // Manual adjustment (vendor/admin)
    this.router.post(
      `${this.path}/adjust`,
      authorizationMiddleware,
      adminOrVendorAuthorizationMiddleware,
      this.inventory.adjust
    );

    // Set reorder level for a variant (vendor/admin)
    this.router.put(
      `${this.path}/variant/:variantId/reorder-level`,
      authorizationMiddleware,
      adminOrVendorAuthorizationMiddleware,
      this.inventory.setReorderLevel
    );

    // Set reorder level for a product – products without variants (vendor/admin)
    this.router.put(
      `${this.path}/product/:productId/reorder-level`,
      authorizationMiddleware,
      adminOrVendorAuthorizationMiddleware,
      this.inventory.setReorderLevelByProductId
    );
  }
}
