import { Inject, Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { INVENTORY_REPOSITORY_TOKEN } from "@/interfaces/inventory/IInventoryRepository.interface";
import type { IInventoryRepository } from "@/interfaces/inventory/IInventoryRepository.interface";
import { INVENTORY_SERVICE_TOKEN } from "@/interfaces/inventory/IInventoryService.interface";
import type { IInventoryService } from "@/interfaces/inventory/IInventoryService.interface";
import { ORDER_REPOSITORY_TOKEN } from "@/interfaces/order/IOrderRepository.interface";
import type { IOrderRepository } from "@/interfaces/order/IOrderRepository.interface";
import type {
  IInventory,
  IInventoryMovement,
  IInventoryRestock,
  IReserveStock,
  IReleaseReservation,
  IRefundStock,
  IAdjustStock,
  IRestockInput,
  ILowStockItem,
} from "@/types/inventory.types";
import { InventoryMovementType } from "@/types/inventory.types";
import ProductVariant from "@/models/product-variant/productVariant.model";
import Product from "@/models/product/product.model";
import { socketService } from "@/services/socket/socket.service";

@Service({ id: INVENTORY_SERVICE_TOKEN })
export class InventoryService implements IInventoryService {
  constructor(
    @Inject(INVENTORY_REPOSITORY_TOKEN) private readonly inventoryRepository: IInventoryRepository,
    @Inject(ORDER_REPOSITORY_TOKEN) private readonly orderRepository: IOrderRepository
  ) {}

  private async syncVariantStock(productVariantId: string, quantityAvailable: number): Promise<void> {
    await ProductVariant.update(
      { stock: quantityAvailable },
      { where: { id: productVariantId } }
    );
    
    // Emit WebSocket event for variant stock update
    socketService.emitVariantStockUpdate(productVariantId, {
      quantityAvailable: quantityAvailable,
      stock: quantityAvailable, // Keep for backward compatibility
      timestamp: new Date().toISOString(),
    });
  }

  private async syncProductStock(productId: string, quantityAvailable: number): Promise<void> {
    await Product.update(
      { initialStock: quantityAvailable },
      { where: { id: productId } }
    );
    
    // Emit WebSocket event for product stock update
    socketService.emitProductStockUpdate(productId, {
      quantityAvailable: quantityAvailable,
      stock: quantityAvailable, // Keep for backward compatibility
      timestamp: new Date().toISOString(),
    });
  }

  public async reserve(data: IReserveStock): Promise<IInventory> {
    if (data.productVariantId) {
      const inv = await this.inventoryRepository.findOrCreateForVariant(data.productVariantId);
      const available = inv.quantityAvailable - inv.quantityReserved;
      if (available < data.quantity) throw new HttpException(400, "Insufficient stock to reserve");
      const result = await this.inventoryRepository.reserve(data.productVariantId, data.quantity);
      
      // Emit WebSocket event for variant stock update
      socketService.emitVariantStockUpdate(data.productVariantId, {
        quantityAvailable: result.quantityAvailable,
        quantityReserved: result.quantityReserved,
        timestamp: new Date().toISOString(),
      });
      
      return result;
    }
    if (data.productId) {
      const inv = await this.inventoryRepository.findOrCreateForProduct(data.productId);
      const available = inv.quantityAvailable - inv.quantityReserved;
      if (available < data.quantity) throw new HttpException(400, "Insufficient stock to reserve");
      const result = await this.inventoryRepository.reserveByProduct(data.productId, data.quantity);
      
      // Emit WebSocket event for product stock update
      socketService.emitProductStockUpdate(data.productId, {
        quantityAvailable: result.quantityAvailable,
        quantityReserved: result.quantityReserved,
        timestamp: new Date().toISOString(),
      });
      
      return result;
    }
    throw new HttpException(400, "Either productVariantId or productId required");
  }

  public async release(data: IReleaseReservation): Promise<IInventory> {
    if (data.productVariantId) {
      const inv = await this.inventoryRepository.findByVariantId(data.productVariantId);
      if (!inv) return null as any;
      const result = await this.inventoryRepository.release(data.productVariantId, data.quantity);
      
      // Emit WebSocket event for variant stock update
      socketService.emitVariantStockUpdate(data.productVariantId, {
        quantityAvailable: result.quantityAvailable,
        quantityReserved: result.quantityReserved,
        timestamp: new Date().toISOString(),
      });
      
      return result;
    }
    if (data.productId) {
      const inv = await this.inventoryRepository.findByProductId(data.productId);
      if (!inv) return null as any;
      const result = await this.inventoryRepository.releaseByProduct(data.productId, data.quantity);
      
      // Emit WebSocket event for product stock update
      socketService.emitProductStockUpdate(data.productId, {
        quantityAvailable: result.quantityAvailable,
        quantityReserved: result.quantityReserved,
        timestamp: new Date().toISOString(),
      });
      
      return result;
    }
    return null as any;
  }

  public async deductOnPaymentSuccess(orderId: string): Promise<void> {
    const order = await this.orderRepository.getOrderWithItems(orderId);
    if (!order || !order.items || order.items.length === 0) return;

    for (const item of order.items) {
      const qty = typeof item.quantity === "number" ? item.quantity : parseInt(String(item.quantity), 10);
      const variantId = item.productVariantId;
      const productId = item.productId;

      if (variantId) {
        const variantExists = await ProductVariant.findByPk(variantId, { attributes: ["id"], raw: true });
        if (!variantExists) {
          // Variant was deleted after order was placed — fall through to product-level
          if (productId) {
            await this.inventoryRepository.deductByProduct(productId, qty);
            await this.inventoryRepository.createMovement({
              productId,
              type: InventoryMovementType.OUT,
              quantity: qty,
              reason: "Sale",
              referenceId: orderId,
              referenceType: "order",
            });
            const updated = await this.inventoryRepository.findByProductId(productId);
            if (updated) await this.syncProductStock(productId, updated.quantityAvailable);
          }
          continue;
        }

        const inv = await this.inventoryRepository.findByVariantId(variantId);
        if (!inv) continue;
        await this.inventoryRepository.deduct(variantId, qty);
        await this.inventoryRepository.createMovement({
          productVariantId: variantId,
          type: InventoryMovementType.OUT,
          quantity: qty,
          reason: "Sale",
          referenceId: orderId,
          referenceType: "order",
        });
        const updated = await this.inventoryRepository.findByVariantId(variantId);
        if (updated) await this.syncVariantStock(variantId, updated.quantityAvailable);
      } else if (productId) {
        const inv = await this.inventoryRepository.findOrCreateForProduct(productId);
        await this.inventoryRepository.deductByProduct(productId, qty);
        await this.inventoryRepository.createMovement({
          productId,
          type: InventoryMovementType.OUT,
          quantity: qty,
          reason: "Sale",
          referenceId: orderId,
          referenceType: "order",
        });
        const updated = await this.inventoryRepository.findByProductId(productId);
        if (updated) await this.syncProductStock(productId, updated.quantityAvailable);
      }
    }
  }

  public async refund(data: IRefundStock): Promise<IInventory> {
    if (data.productVariantId) {
      await this.inventoryRepository.findOrCreateForVariant(data.productVariantId);
      await this.inventoryRepository.addAvailable(data.productVariantId, data.quantity);
      await this.inventoryRepository.createMovement({
        productVariantId: data.productVariantId,
        type: InventoryMovementType.IN,
        quantity: data.quantity,
        reason: data.reason || "Refund",
        referenceId: data.returnId || data.orderItemId,
        referenceType: "refund",
      });
      const inv = await this.inventoryRepository.findByVariantId(data.productVariantId);
      if (inv) await this.syncVariantStock(data.productVariantId, inv.quantityAvailable);
      return inv!;
    }
    if (data.productId) {
      await this.inventoryRepository.findOrCreateForProduct(data.productId);
      await this.inventoryRepository.addAvailableByProduct(data.productId, data.quantity);
      await this.inventoryRepository.createMovement({
        productId: data.productId,
        type: InventoryMovementType.IN,
        quantity: data.quantity,
        reason: data.reason || "Refund",
        referenceId: data.returnId || data.orderItemId,
        referenceType: "refund",
      });
      const inv = await this.inventoryRepository.findByProductId(data.productId);
      if (inv) await this.syncProductStock(data.productId, inv.quantityAvailable);
      return inv!;
    }
    throw new HttpException(400, "Either productVariantId or productId required");
  }

  public async adjust(data: IAdjustStock): Promise<IInventory> {
    if (data.productVariantId) {
      await this.inventoryRepository.findOrCreateForVariant(data.productVariantId);
      const inv = await this.inventoryRepository.findByVariantId(data.productVariantId)!;
      if (data.quantityDelta > 0) {
        await this.inventoryRepository.addAvailable(data.productVariantId, data.quantityDelta);
      } else {
        const deductQty = Math.abs(data.quantityDelta);
        const available = inv.quantityAvailable - inv.quantityReserved;
        if (available < deductQty) throw new HttpException(400, "Insufficient available stock to adjust");
        await this.inventoryRepository.updateQuantityAvailable(
          data.productVariantId,
          inv.quantityAvailable + data.quantityDelta
        );
      }
      await this.inventoryRepository.createMovement({
        productVariantId: data.productVariantId,
        type: InventoryMovementType.ADJUSTMENT,
        quantity: Math.abs(data.quantityDelta),
        reason: data.reason,
        referenceId: data.referenceId || null,
        referenceType: "manual",
      });
      const updated = await this.inventoryRepository.findByVariantId(data.productVariantId);
      if (updated) await this.syncVariantStock(data.productVariantId, updated.quantityAvailable);
      return updated!;
    }
    if (data.productId) {
      await this.inventoryRepository.findOrCreateForProduct(data.productId);
      const inv = await this.inventoryRepository.findByProductId(data.productId)!;
      if (data.quantityDelta > 0) {
        await this.inventoryRepository.addAvailableByProduct(data.productId, data.quantityDelta);
      } else {
        const deductQty = Math.abs(data.quantityDelta);
        const available = inv.quantityAvailable - inv.quantityReserved;
        if (available < deductQty) throw new HttpException(400, "Insufficient available stock to adjust");
        await this.inventoryRepository.updateQuantityAvailableByProductId(
          data.productId,
          inv.quantityAvailable + data.quantityDelta
        );
      }
      await this.inventoryRepository.createMovement({
        productId: data.productId,
        type: InventoryMovementType.ADJUSTMENT,
        quantity: Math.abs(data.quantityDelta),
        reason: data.reason,
        referenceId: data.referenceId || null,
        referenceType: "manual",
      });
      const updated = await this.inventoryRepository.findByProductId(data.productId);
      if (updated) await this.syncProductStock(data.productId, updated.quantityAvailable);
      return updated!;
    }
    throw new HttpException(400, "Either productVariantId or productId required");
  }

  public async restock(
    data: IRestockInput
  ): Promise<{ inventory: IInventory; restock: IInventoryRestock }> {
    const restockDate = data.restockDate || new Date();
    if (data.productVariantId) {
      await this.inventoryRepository.findOrCreateForVariant(data.productVariantId);
      await this.inventoryRepository.addAvailable(data.productVariantId, data.quantityAdded);
      const restock = await this.inventoryRepository.createRestock({
        productVariantId: data.productVariantId,
        quantityAdded: data.quantityAdded,
        costPerUnit: data.costPerUnit,
        supplierName: data.supplierName,
        restockDate,
      });
      await this.inventoryRepository.createMovement({
        productVariantId: data.productVariantId,
        type: InventoryMovementType.IN,
        quantity: data.quantityAdded,
        reason: `Restock: ${data.supplierName}`,
        referenceId: restock.id,
        referenceType: "restock",
      });
      const inventory = await this.inventoryRepository.findByVariantId(data.productVariantId);
      if (inventory) await this.syncVariantStock(data.productVariantId, inventory.quantityAvailable);
      return { inventory: inventory!, restock };
    }
    if (data.productId) {
      await this.inventoryRepository.findOrCreateForProduct(data.productId);
      await this.inventoryRepository.addAvailableByProduct(data.productId, data.quantityAdded);
      const restock = await this.inventoryRepository.createRestock({
        productId: data.productId,
        quantityAdded: data.quantityAdded,
        costPerUnit: data.costPerUnit,
        supplierName: data.supplierName,
        restockDate,
      });
      await this.inventoryRepository.createMovement({
        productId: data.productId,
        type: InventoryMovementType.IN,
        quantity: data.quantityAdded,
        reason: `Restock: ${data.supplierName}`,
        referenceId: restock.id,
        referenceType: "restock",
      });
      const inventory = await this.inventoryRepository.findByProductId(data.productId);
      if (inventory) await this.syncProductStock(data.productId, inventory.quantityAvailable);
      return { inventory: inventory!, restock };
    }
    throw new HttpException(400, "Either productVariantId or productId required");
  }

  public async getByVariantId(productVariantId: string): Promise<IInventory | null> {
    return this.inventoryRepository.findByVariantId(productVariantId);
  }

  public async getByProductId(productId: string): Promise<IInventory | null> {
    return this.inventoryRepository.findByProductId(productId);
  }

  public async getAvailableQuantity(variantOrProduct: {
    productVariantId?: string;
    productId?: string;
  }): Promise<number> {
    if (variantOrProduct.productVariantId) {
      const inv = await this.inventoryRepository.findByVariantId(variantOrProduct.productVariantId);
      if (inv) return inv.quantityAvailable - inv.quantityReserved;
      const variant = await ProductVariant.findByPk(variantOrProduct.productVariantId, { raw: true }) as any;
      return variant?.stock ?? 0;
    }
    if (variantOrProduct.productId) {
      const inv = await this.inventoryRepository.findByProductId(variantOrProduct.productId);
      if (inv) return inv.quantityAvailable - inv.quantityReserved;
      const product = await Product.findByPk(variantOrProduct.productId, { raw: true }) as any;
      return product?.initialStock ?? 0;
    }
    return 0;
  }

  public async getMovements(
    productVariantId: string,
    limit?: number
  ): Promise<IInventoryMovement[]> {
    return this.inventoryRepository.getMovements(productVariantId, limit);
  }

  public async getMovementsByProductId(productId: string, limit?: number): Promise<IInventoryMovement[]> {
    return this.inventoryRepository.getMovementsByProductId(productId, limit);
  }

  public async getLowStockByVendorId(vendorId: string): Promise<ILowStockItem[]> {
    const rows = await this.inventoryRepository.getLowStockByVendorId(vendorId);
    return rows.map((i: any) => ({
      productVariantId: i.productVariantId,
      productId: i.productId,
      quantityAvailable: i.quantityAvailable,
      quantityReserved: i.quantityReserved,
      reorderLevel: i.reorderLevel,
      variant: i.variant
        ? { sku: i.variant.sku, name: i.variant.name, productId: i.variant.productId }
        : undefined,
      product: i.product ? { id: i.product.id, title: i.product.title, sku: i.product.sku } : undefined,
    }));
  }

  public async setReorderLevel(productVariantId: string, reorderLevel: number): Promise<IInventory> {
    return this.inventoryRepository.setReorderLevel(productVariantId, reorderLevel);
  }

  public async setReorderLevelByProductId(productId: string, reorderLevel: number): Promise<IInventory> {
    return this.inventoryRepository.setReorderLevelByProductId(productId, reorderLevel);
  }

  public async ensureInventoryForVariant(
    productVariantId: string,
    initialAvailable: number = 0
  ): Promise<IInventory> {
    const inv = await this.inventoryRepository.findOrCreateForVariant(
      productVariantId,
      initialAvailable
    );
    await this.syncVariantStock(productVariantId, inv.quantityAvailable);
    return inv;
  }

  public async ensureInventoryForProduct(
    productId: string,
    initialAvailable: number = 0
  ): Promise<IInventory> {
    const inv = await this.inventoryRepository.findOrCreateForProduct(productId, initialAvailable);
    await this.syncProductStock(productId, inv.quantityAvailable);
    return inv;
  }
}
