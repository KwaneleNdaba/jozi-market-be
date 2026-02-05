import { Router } from "express";
import { socketService } from "@/services/socket/socket.service";
import Inventory from "@/models/inventory/inventory.model";
import ProductVariant from "@/models/product-variant/productVariant.model";
import type { Routes } from "@/types/routes.interface";
import type { Request, Response } from "express";

export class TestRoute implements Routes {
  public path = "/test";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * Test endpoint to manually trigger WebSocket stock updates
     * POST /api/test/websocket/stock
     */
    this.router.post(`${this.path}/websocket/stock`, this.triggerStockUpdate);
  }

  private triggerStockUpdate = async (req: Request, res: Response) => {
    try {
      const { productId, variantId } = req.body;

      if (productId) {
        // Emit product stock update
        const inventory = await Inventory.findOne({
          where: { productId },
        });

        if (!inventory) {
          return res.status(404).json({
            error: true,
            message: "Inventory not found for product",
          });
        }

        socketService.emitProductStockUpdate(productId, {
          quantityAvailable: inventory.quantityAvailable,
          quantityReserved: inventory.quantityReserved,
          reorderLevel: inventory.reorderLevel,
          stock: inventory.quantityAvailable,
          timestamp: new Date().toISOString(),
        });

        return res.status(200).json({
          error: false,
          message: "Product stock update emitted via WebSocket",
          data: {
            productId,
            quantityAvailable: inventory.quantityAvailable,
            quantityReserved: inventory.quantityReserved,
          },
        });
      }

      if (variantId) {
        // Emit variant stock update
        const inventory = await Inventory.findOne({
          where: { productVariantId: variantId },
        });

        const variant = await ProductVariant.findByPk(variantId);

        if (!inventory || !variant) {
          return res.status(404).json({
            error: true,
            message: "Inventory or variant not found",
          });
        }

        socketService.emitVariantStockUpdate(variantId, {
          quantityAvailable: inventory.quantityAvailable,
          quantityReserved: inventory.quantityReserved,
          reorderLevel: inventory.reorderLevel,
          stock: inventory.quantityAvailable,
          timestamp: new Date().toISOString(),
        });

        return res.status(200).json({
          error: false,
          message: "Variant stock update emitted via WebSocket",
          data: {
            variantId,
            quantityAvailable: inventory.quantityAvailable,
            quantityReserved: inventory.quantityReserved,
          },
        });
      }

      return res.status(400).json({
        error: true,
        message: "Either productId or variantId is required",
      });
    } catch (error: any) {
      return res.status(500).json({
        error: true,
        message: error.message,
      });
    }
  };
}
