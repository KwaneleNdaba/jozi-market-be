import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { INVENTORY_SERVICE_TOKEN } from "@/interfaces/inventory/IInventoryService.interface";
import type { CustomResponse } from "@/types/response.interface";
import type { IInventory, IInventoryMovement, IInventoryRestock, ILowStockItem } from "@/types/inventory.types";
import { PRODUCT_REPOSITORY_TOKEN } from "@/interfaces/product/IProductRepository.interface";
import type { IProductRepository } from "@/interfaces/product/IProductRepository.interface";

export class InventoryController {
  private readonly inventoryService: any;
  private readonly productRepository: IProductRepository;

  constructor() {
    this.inventoryService = Container.get(INVENTORY_SERVICE_TOKEN);
    this.productRepository = Container.get(PRODUCT_REPOSITORY_TOKEN);
  }

  public getByVariantId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { variantId } = req.params;
      const inv = await this.inventoryService.getByVariantId(variantId);
      if (!inv) {
        throw new HttpException(404, "Inventory not found for this variant");
      }
      const response: CustomResponse<IInventory> = {
        data: inv,
        message: "Inventory retrieved",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getByProductId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { productId } = req.params;
      const inv = await this.inventoryService.getByProductId(productId);
      if (!inv) {
        throw new HttpException(404, "Inventory not found for this product");
      }
      const response: CustomResponse<IInventory> = {
        data: inv,
        message: "Inventory retrieved",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getMovements = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { variantId } = req.params;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 100;
      const movements = await this.inventoryService.getMovements(variantId, limit);
      const response: CustomResponse<IInventoryMovement[]> = {
        data: movements,
        message: "Movements retrieved",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getMovementsByProductId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { productId } = req.params;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 100;
      const movements = await this.inventoryService.getMovementsByProductId(productId, limit);
      const response: CustomResponse<IInventoryMovement[]> = {
        data: movements,
        message: "Movements retrieved",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getLowStock = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { vendorId } = req.params;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      if (userRole !== "admin" && userId !== vendorId) {
        throw new HttpException(403, "You can only view your own vendor low stock");
      }
      const items = await this.inventoryService.getLowStockByVendorId(vendorId);
      const response: CustomResponse<ILowStockItem[]> = {
        data: items,
        message: "Low stock items retrieved",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public restock = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { productVariantId, productId, quantityAdded, costPerUnit, supplierName, restockDate } = req.body;
      if (quantityAdded == null || quantityAdded < 1) {
        throw new HttpException(400, "Positive quantityAdded required");
      }
      if (!productVariantId && !productId) {
        throw new HttpException(400, "productVariantId or productId required");
      }
      const result = await this.inventoryService.restock({
        productVariantId: productVariantId || null,
        productId: productId || null,
        quantityAdded,
        costPerUnit: costPerUnit ?? 0,
        supplierName: supplierName || "Manual",
        restockDate: restockDate ? new Date(restockDate) : new Date(),
      });
      const response: CustomResponse<{ inventory: IInventory; restock: IInventoryRestock }> = {
        data: result,
        message: "Restock recorded",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public adjust = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { productVariantId, productId, quantityDelta, reason, referenceId } = req.body;
      if ((!productVariantId && !productId) || quantityDelta == null || quantityDelta === 0 || !reason) {
        throw new HttpException(400, "productVariantId or productId, non-zero quantityDelta, and reason required");
      }
      const inv = await this.inventoryService.adjust({
        productVariantId: productVariantId || null,
        productId: productId || null,
        quantityDelta: parseInt(String(quantityDelta), 10),
        reason,
        referenceId: referenceId || null,
      });
      const response: CustomResponse<IInventory> = {
        data: inv,
        message: "Inventory adjusted",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public setReorderLevel = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { variantId } = req.params;
      const { reorderLevel } = req.body;
      if (reorderLevel == null || reorderLevel < 0) {
        throw new HttpException(400, "reorderLevel (non-negative number) required");
      }
      const inv = await this.inventoryService.setReorderLevel(variantId, reorderLevel);
      const response: CustomResponse<IInventory> = {
        data: inv,
        message: "Reorder level updated",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public setReorderLevelByProductId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { productId } = req.params;
      const { reorderLevel } = req.body;
      if (reorderLevel == null || reorderLevel < 0) {
        throw new HttpException(400, "reorderLevel (non-negative number) required");
      }
      const inv = await this.inventoryService.setReorderLevelByProductId(productId, reorderLevel);
      const response: CustomResponse<IInventory> = {
        data: inv,
        message: "Reorder level updated",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
