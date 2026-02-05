export enum InventoryMovementType {
  IN = "IN",
  OUT = "OUT",
  ADJUSTMENT = "ADJUSTMENT",
  RETURN = "RETURN",
}

export type InventoryReferenceType =
  | "order"
  | "order_item"
  | "cart"
  | "restock"
  | "refund"
  | "reservation_release"
  | "manual";

export interface IInventory {
  id?: string;
  productVariantId?: string | null;
  productId?: string | null;
  quantityAvailable: number;
  quantityReserved: number;
  reorderLevel: number;
  warehouseLocation?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IInventoryMovement {
  id?: string;
  productVariantId?: string | null;
  productId?: string | null;
  type: InventoryMovementType | string;
  quantity: number;
  reason: string;
  referenceId?: string | null;
  referenceType?: string | null;
  createdAt?: Date;
}

export interface IInventoryRestock {
  id?: string;
  productVariantId?: string | null;
  productId?: string | null;
  quantityAdded: number;
  costPerUnit: number;
  supplierName: string;
  restockDate: Date;
  createdAt?: Date;
}

/** Reserve by variant (productVariantId) or by product when no variants (productId). */
export interface IReserveStock {
  productVariantId?: string | null;
  productId?: string | null;
  quantity: number;
  referenceId?: string | null;
  referenceType?: InventoryReferenceType;
}

export interface IReleaseReservation {
  productVariantId?: string | null;
  productId?: string | null;
  quantity: number;
  referenceId?: string | null;
}

export interface IDeductStock {
  productVariantId?: string | null;
  productId?: string | null;
  quantity: number;
  orderId: string;
  orderItemId: string;
  reason?: string;
}

export interface IRefundStock {
  productVariantId?: string | null;
  productId?: string | null;
  quantity: number;
  orderItemId: string;
  returnId?: string | null;
  reason?: string;
}

export interface IAdjustStock {
  productVariantId?: string | null;
  productId?: string | null;
  quantityDelta: number; // positive = add, negative = subtract
  reason: string;
  referenceId?: string | null;
}

export interface IRestockInput {
  productVariantId?: string | null;
  productId?: string | null;
  quantityAdded: number;
  costPerUnit: number;
  supplierName: string;
  restockDate?: Date;
}

export interface ILowStockItem {
  productVariantId?: string | null;
  productId?: string | null;
  quantityAvailable: number;
  quantityReserved: number;
  reorderLevel: number;
  variant?: { sku: string; name: string; productId: string };
  product?: { id: string; title: string; sku: string };
}
