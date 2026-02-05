import { Token } from "typedi";
import type {
  IInventory,
  IInventoryMovement,
  IInventoryRestock,
} from "@/types/inventory.types";

export interface IInventoryRepository {
  findByVariantId(productVariantId: string): Promise<IInventory | null>;
  findByProductId(productId: string): Promise<IInventory | null>;
  findOrCreateForVariant(productVariantId: string, initialAvailable?: number): Promise<IInventory>;
  findOrCreateForProduct(productId: string, initialAvailable?: number): Promise<IInventory>;
  updateQuantityAvailable(productVariantId: string, quantityAvailable: number): Promise<IInventory>;
  updateQuantityReserved(productVariantId: string, quantityReserved: number): Promise<IInventory>;
  updateQuantityAvailableByProductId(productId: string, quantityAvailable: number): Promise<IInventory>;
  updateQuantityReservedByProductId(productId: string, quantityReserved: number): Promise<IInventory>;
  reserve(productVariantId: string, quantity: number): Promise<IInventory>;
  release(productVariantId: string, quantity: number): Promise<IInventory>;
  reserveByProduct(productId: string, quantity: number): Promise<IInventory>;
  releaseByProduct(productId: string, quantity: number): Promise<IInventory>;
  deduct(productVariantId: string, quantity: number): Promise<IInventory>;
  deductByProduct(productId: string, quantity: number): Promise<IInventory>;
  addAvailable(productVariantId: string, quantity: number): Promise<IInventory>;
  addAvailableByProduct(productId: string, quantity: number): Promise<IInventory>;
  createMovement(data: {
    productVariantId?: string | null;
    productId?: string | null;
    type: string;
    quantity: number;
    reason: string;
    referenceId?: string | null;
    referenceType?: string | null;
  }): Promise<IInventoryMovement>;
  createRestock(data: {
    productVariantId?: string | null;
    productId?: string | null;
    quantityAdded: number;
    costPerUnit: number;
    supplierName: string;
    restockDate: Date;
  }): Promise<IInventoryRestock>;
  getMovements(productVariantId: string, limit?: number): Promise<IInventoryMovement[]>;
  getMovementsByProductId(productId: string, limit?: number): Promise<IInventoryMovement[]>;
  getLowStockByVendorId(vendorId: string): Promise<IInventory[]>;
  setReorderLevel(productVariantId: string, reorderLevel: number): Promise<IInventory>;
  setReorderLevelByProductId(productId: string, reorderLevel: number): Promise<IInventory>;
}

export const INVENTORY_REPOSITORY_TOKEN = new Token<IInventoryRepository>("IInventoryRepository");
