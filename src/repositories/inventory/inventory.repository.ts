import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  type IInventoryRepository,
  INVENTORY_REPOSITORY_TOKEN,
} from "@/interfaces/inventory/IInventoryRepository.interface";
import type {
  IInventory,
  IInventoryMovement,
  IInventoryRestock,
} from "@/types/inventory.types";
import Inventory from "@/models/inventory/inventory.model";
import InventoryMovement from "@/models/inventory-movement/inventoryMovement.model";
import InventoryRestock from "@/models/inventory-restock/inventoryRestock.model";
import ProductVariant from "@/models/product-variant/productVariant.model";
import Product from "@/models/product/product.model";
import { Op } from "sequelize";

@Service({ id: INVENTORY_REPOSITORY_TOKEN })
export class InventoryRepository implements IInventoryRepository {
  public async findByVariantId(productVariantId: string): Promise<IInventory | null> {
    try {
      const row = await Inventory.findOne({
        where: { productVariantId },
        raw: true,
      });
      return row as IInventory | null;
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async findByProductId(productId: string): Promise<IInventory | null> {
    try {
      const row = await Inventory.findOne({
        where: { productId },
        raw: true,
      });
      return row as IInventory | null;
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async findOrCreateForVariant(
    productVariantId: string,
    initialAvailable?: number
  ): Promise<IInventory> {
    try {
      let inv = await Inventory.findOne({ where: { productVariantId }, raw: false });
      if (!inv) {
        if (initialAvailable === undefined) {
          const variant = await ProductVariant.findByPk(productVariantId, { raw: true }) as any;
          initialAvailable = variant?.stock ?? 0;
        }
        inv = await Inventory.create({
          productVariantId,
          quantityAvailable: initialAvailable,
          quantityReserved: 0,
          reorderLevel: 0,
        } as any);
      }
      return inv.get({ plain: true }) as IInventory;
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async findOrCreateForProduct(
    productId: string,
    initialAvailable?: number
  ): Promise<IInventory> {
    try {
      let inv = await Inventory.findOne({ where: { productId }, raw: false });
      if (!inv) {
        if (initialAvailable === undefined) {
          const product = await Product.findByPk(productId, { raw: true }) as any;
          initialAvailable = product?.initialStock ?? 0;
        }
        inv = await Inventory.create({
          productId,
          productVariantId: null,
          quantityAvailable: initialAvailable,
          quantityReserved: 0,
          reorderLevel: 0,
        } as any);
      }
      return inv.get({ plain: true }) as IInventory;
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async updateQuantityAvailable(
    productVariantId: string,
    quantityAvailable: number
  ): Promise<IInventory> {
    try {
      const inv = await Inventory.findOne({ where: { productVariantId }, raw: false });
      if (!inv) throw new HttpException(404, "Inventory not found for variant");
      await inv.update({ quantityAvailable });
      return inv.get({ plain: true }) as IInventory;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message);
    }
  }

  public async updateQuantityReserved(
    productVariantId: string,
    quantityReserved: number
  ): Promise<IInventory> {
    try {
      const inv = await Inventory.findOne({ where: { productVariantId }, raw: false });
      if (!inv) throw new HttpException(404, "Inventory not found for variant");
      await inv.update({ quantityReserved });
      return inv.get({ plain: true }) as IInventory;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message);
    }
  }

  public async updateQuantityAvailableByProductId(
    productId: string,
    quantityAvailable: number
  ): Promise<IInventory> {
    try {
      const inv = await Inventory.findOne({ where: { productId }, raw: false });
      if (!inv) throw new HttpException(404, "Inventory not found for product");
      await inv.update({ quantityAvailable });
      return inv.get({ plain: true }) as IInventory;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message);
    }
  }

  public async updateQuantityReservedByProductId(
    productId: string,
    quantityReserved: number
  ): Promise<IInventory> {
    try {
      const inv = await Inventory.findOne({ where: { productId }, raw: false });
      if (!inv) throw new HttpException(404, "Inventory not found for product");
      await inv.update({ quantityReserved });
      return inv.get({ plain: true }) as IInventory;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message);
    }
  }

  public async reserve(productVariantId: string, quantity: number): Promise<IInventory> {
    try {
      const inv = await Inventory.findOne({ where: { productVariantId }, raw: false });
      if (!inv) throw new HttpException(404, "Inventory not found for variant");
      const current = inv.get({ plain: true }) as IInventory;
      const newReserved = current.quantityReserved + quantity;
      if (current.quantityAvailable < quantity) {
        throw new HttpException(400, "Insufficient available stock to reserve");
      }
      await inv.update({ quantityReserved: newReserved });
      return inv.get({ plain: true }) as IInventory;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message);
    }
  }

  public async release(productVariantId: string, quantity: number): Promise<IInventory> {
    try {
      const inv = await Inventory.findOne({ where: { productVariantId }, raw: false });
      if (!inv) throw new HttpException(404, "Inventory not found for variant");
      const current = inv.get({ plain: true }) as IInventory;
      const newReserved = Math.max(0, current.quantityReserved - quantity);
      await inv.update({ quantityReserved: newReserved });
      return inv.get({ plain: true }) as IInventory;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message);
    }
  }

  public async reserveByProduct(productId: string, quantity: number): Promise<IInventory> {
    try {
      const inv = await Inventory.findOne({ where: { productId }, raw: false });
      if (!inv) throw new HttpException(404, "Inventory not found for product");
      const current = inv.get({ plain: true }) as IInventory;
      const newReserved = current.quantityReserved + quantity;
      if (current.quantityAvailable < quantity) {
        throw new HttpException(400, "Insufficient available stock to reserve");
      }
      await inv.update({ quantityReserved: newReserved });
      return inv.get({ plain: true }) as IInventory;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message);
    }
  }

  public async releaseByProduct(productId: string, quantity: number): Promise<IInventory> {
    try {
      const inv = await Inventory.findOne({ where: { productId }, raw: false });
      if (!inv) throw new HttpException(404, "Inventory not found for product");
      const current = inv.get({ plain: true }) as IInventory;
      const newReserved = Math.max(0, current.quantityReserved - quantity);
      await inv.update({ quantityReserved: newReserved });
      return inv.get({ plain: true }) as IInventory;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message);
    }
  }

  public async deduct(productVariantId: string, quantity: number): Promise<IInventory> {
    try {
      const inv = await Inventory.findOne({ where: { productVariantId }, raw: false });
      if (!inv) throw new HttpException(404, "Inventory not found for variant");
      const current = inv.get({ plain: true }) as IInventory;
      const newAvailable = current.quantityAvailable - quantity;
      const newReserved = Math.max(0, current.quantityReserved - quantity);
      if (newAvailable < 0) throw new HttpException(400, "Insufficient stock to deduct");
      await inv.update({ quantityAvailable: newAvailable, quantityReserved: newReserved });
      return inv.get({ plain: true }) as IInventory;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message);
    }
  }

  public async deductByProduct(productId: string, quantity: number): Promise<IInventory> {
    try {
      const inv = await Inventory.findOne({ where: { productId }, raw: false });
      if (!inv) throw new HttpException(404, "Inventory not found for product");
      const current = inv.get({ plain: true }) as IInventory;
      const newAvailable = current.quantityAvailable - quantity;
      const newReserved = Math.max(0, current.quantityReserved - quantity);
      if (newAvailable < 0) throw new HttpException(400, "Insufficient stock to deduct");
      await inv.update({ quantityAvailable: newAvailable, quantityReserved: newReserved });
      return inv.get({ plain: true }) as IInventory;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message);
    }
  }

  public async addAvailable(productVariantId: string, quantity: number): Promise<IInventory> {
    try {
      const inv = await Inventory.findOne({ where: { productVariantId }, raw: false });
      if (!inv) throw new HttpException(404, "Inventory not found for variant");
      const current = inv.get({ plain: true }) as IInventory;
      await inv.update({ quantityAvailable: current.quantityAvailable + quantity });
      return inv.get({ plain: true }) as IInventory;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message);
    }
  }

  public async addAvailableByProduct(productId: string, quantity: number): Promise<IInventory> {
    try {
      const inv = await Inventory.findOne({ where: { productId }, raw: false });
      if (!inv) throw new HttpException(404, "Inventory not found for product");
      const current = inv.get({ plain: true }) as IInventory;
      await inv.update({ quantityAvailable: current.quantityAvailable + quantity });
      return inv.get({ plain: true }) as IInventory;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message);
    }
  }

  public async createMovement(data: {
    productVariantId?: string | null;
    productId?: string | null;
    type: string;
    quantity: number;
    reason: string;
    referenceId?: string | null;
    referenceType?: string | null;
  }): Promise<IInventoryMovement> {
    try {
      const movement = await InventoryMovement.create(data as any);
      return movement.get({ plain: true }) as IInventoryMovement;
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async createRestock(data: {
    productVariantId?: string | null;
    productId?: string | null;
    quantityAdded: number;
    costPerUnit: number;
    supplierName: string;
    restockDate: Date;
  }): Promise<IInventoryRestock> {
    try {
      const restock = await InventoryRestock.create(data as any);
      return restock.get({ plain: true }) as IInventoryRestock;
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getMovements(
    productVariantId: string,
    limit: number = 100
  ): Promise<IInventoryMovement[]> {
    try {
      const rows = await InventoryMovement.findAll({
        where: { productVariantId },
        order: [["createdAt", "DESC"]],
        limit,
        raw: true,
      });
      return rows as IInventoryMovement[];
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getMovementsByProductId(
    productId: string,
    limit: number = 100
  ): Promise<IInventoryMovement[]> {
    try {
      const rows = await InventoryMovement.findAll({
        where: { productId },
        order: [["createdAt", "DESC"]],
        limit,
        raw: true,
      });
      return rows as IInventoryMovement[];
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getLowStockByVendorId(vendorId: string): Promise<IInventory[]> {
    try {
      // Variant-level inventory (product has variants)
      const variantRows = await Inventory.findAll({
        where: { productVariantId: { [Op.ne]: null } },
        include: [
          {
            model: ProductVariant,
            as: "variant",
            required: true,
            include: [
              {
                model: Product,
                as: "product",
                required: true,
                where: { userId: vendorId },
                attributes: [],
              },
            ],
            attributes: ["id", "sku", "name", "productId"],
          },
        ],
        raw: false,
      });
      // Product-level inventory (products without variants)
      const productRows = await Inventory.findAll({
        where: { productId: { [Op.ne]: null } },
        include: [
          {
            model: Product,
            as: "product",
            required: true,
            where: { userId: vendorId },
            attributes: ["id", "title", "sku"],
          },
        ],
        raw: false,
      });
      const invs = [
        ...variantRows.map((r) => r.get({ plain: true })),
        ...productRows.map((r) => r.get({ plain: true })),
      ] as any[];
      const lowStock = invs.filter(
        (i) => i.quantityAvailable <= i.reorderLevel && i.reorderLevel > 0
      );
      return lowStock;
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async setReorderLevel(
    productVariantId: string,
    reorderLevel: number
  ): Promise<IInventory> {
    try {
      const inv = await Inventory.findOne({ where: { productVariantId }, raw: false });
      if (!inv) throw new HttpException(404, "Inventory not found for variant");
      await inv.update({ reorderLevel });
      return inv.get({ plain: true }) as IInventory;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message);
    }
  }

  public async setReorderLevelByProductId(
    productId: string,
    reorderLevel: number
  ): Promise<IInventory> {
    try {
      const inv = await Inventory.findOne({ where: { productId }, raw: false });
      if (!inv) throw new HttpException(404, "Inventory not found for product");
      await inv.update({ reorderLevel });
      return inv.get({ plain: true }) as IInventory;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message);
    }
  }
}
