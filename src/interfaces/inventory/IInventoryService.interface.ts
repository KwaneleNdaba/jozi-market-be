import { Token } from "typedi";
import type {
  IInventory,
  IInventoryMovement,
  IInventoryRestock,
  IReserveStock,
  IReleaseReservation,
  IDeductStock,
  IRefundStock,
  IAdjustStock,
  IRestockInput,
  ILowStockItem,
} from "@/types/inventory.types";

export interface IInventoryService {
  /** Reserve stock when item is added to cart. */
  reserve(data: IReserveStock): Promise<IInventory>;
  /** Release reservation when item is removed from cart or quantity reduced. */
  release(data: IReleaseReservation): Promise<IInventory>;
  /** Deduct stock after payment success (available -= qty, reserved -= qty, create OUT movement). */
  deductOnPaymentSuccess(orderId: string): Promise<void>;
  /** Restore stock on refund (available += qty, create IN movement). */
  refund(data: IRefundStock): Promise<IInventory>;
  /** Manual adjustment with movement record. */
  adjust(data: IAdjustStock): Promise<IInventory>;
  /** Record restock and increase available stock. */
  restock(data: IRestockInput): Promise<{ inventory: IInventory; restock: IInventoryRestock }>;
  getByVariantId(productVariantId: string): Promise<IInventory | null>;
  getByProductId(productId: string): Promise<IInventory | null>;
  /** Available = quantityAvailable - quantityReserved. Pass variantId OR productId (for products without variants). */
  getAvailableQuantity(variantOrProduct: { productVariantId?: string; productId?: string }): Promise<number>;
  getMovements(productVariantId: string, limit?: number): Promise<IInventoryMovement[]>;
  getMovementsByProductId(productId: string, limit?: number): Promise<IInventoryMovement[]>;
  getLowStockByVendorId(vendorId: string): Promise<ILowStockItem[]>;
  setReorderLevel(productVariantId: string, reorderLevel: number): Promise<IInventory>;
  setReorderLevelByProductId(productId: string, reorderLevel: number): Promise<IInventory>;
  /** Ensure inventory row exists for variant (e.g. when creating variant). */
  ensureInventoryForVariant(productVariantId: string, initialAvailable?: number): Promise<IInventory>;
  /** Ensure inventory row exists for product without variants (e.g. when creating product). */
  ensureInventoryForProduct(productId: string, initialAvailable?: number): Promise<IInventory>;
}

export const INVENTORY_SERVICE_TOKEN = new Token<IInventoryService>("IInventoryService");
