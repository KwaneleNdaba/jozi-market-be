import { Inject, Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { type IReturnRepository, RETURN_REPOSITORY_TOKEN } from "@/interfaces/return/IReturnRepository.interface";
import { type IReturnService, RETURN_SERVICE_TOKEN } from "@/interfaces/return/IReturnService.interface";
import { ORDER_REPOSITORY_TOKEN } from "@/interfaces/order/IOrderRepository.interface";
import type { IOrderRepository } from "@/interfaces/order/IOrderRepository.interface";
import { OrderStatus, PaymentStatus } from "@/types/order.types";
import { ReturnStatus, RefundStatus } from "@/types/return.types";
import type {
  IReturn,
  IReturnItem,
  ICreateReturn,
  IUpdateReturn,
  IReviewReturn,
  IReviewReturnItem,
} from "@/types/return.types";
import dbConnection from "@/database";
import Order from "@/models/order/order.model";
import OrderItem from "@/models/order-item/orderItem.model";

@Service({ id: RETURN_SERVICE_TOKEN })
export class ReturnService implements IReturnService {
  constructor(
    @Inject(RETURN_REPOSITORY_TOKEN) private readonly returnRepository: IReturnRepository,
    @Inject(ORDER_REPOSITORY_TOKEN) private readonly orderRepository: IOrderRepository
  ) {}

  public async createReturn(userId: string, returnData: ICreateReturn): Promise<IReturn> {
    const transaction = await dbConnection.transaction();

    try {
      // Verify order exists and belongs to user
      const order = await this.orderRepository.findById(returnData.orderId);
      if (!order) {
        throw new HttpException(404, "Order not found");
      }

      if (order.userId !== userId) {
        throw new HttpException(403, "You do not have permission to return this order");
      }

      // Only delivered orders can be returned
      if (order.status !== OrderStatus.DELIVERED) {
        throw new HttpException(400, "Only delivered orders can be returned");
      }

      // Validate return items
      const orderWithItems = await this.orderRepository.getOrderWithItems(returnData.orderId);
      if (!orderWithItems || !orderWithItems.items || orderWithItems.items.length === 0) {
        throw new HttpException(400, "Order has no items");
      }

      // Validate each return item
      for (const returnItem of returnData.items) {
        const orderItem = orderWithItems.items.find((item) => item.id === returnItem.orderItemId);
        if (!orderItem) {
          throw new HttpException(404, `Order item ${returnItem.orderItemId} not found`);
        }

        // Prevent multiple returns for the same order item
        if ((orderItem as any).isReturnRequested) {
          throw new HttpException(400, "Return has already been requested for one or more items in this request");
        }

        if (returnItem.quantity <= 0 || returnItem.quantity > orderItem.quantity) {
          throw new HttpException(
            400,
            `Return quantity must be between 1 and ${orderItem.quantity} for item ${returnItem.orderItemId}`
          );
        }
      }

      // Create return record - ensure userId is included
      const returnRecord = await this.returnRepository.create({
        ...returnData,
        userId, // Use the userId from the authenticated user, not from request body
      });

      // Create return items
      for (const returnItem of returnData.items) {
        await this.returnRepository.createReturnItem({
          returnId: returnRecord.id!,
          orderItemId: returnItem.orderItemId,
          quantity: returnItem.quantity,
          reason: returnItem.reason,
        });
        // Note: OrderItem status remains "delivered" - return status is tracked in ReturnItem
      }

      // Set return flags on order and affected order items
      await Order.update(
        { isReturnRequested: true },
        {
          where: { id: returnData.orderId },
          transaction,
        }
      );
      const orderItemIds = returnData.items.map((item) => item.orderItemId);
      if (orderItemIds.length > 0) {
        await OrderItem.update(
          { isReturnRequested: true },
          {
            where: { id: orderItemIds },
            transaction,
          }
        );
      }

      await transaction.commit();

      // Fetch and return the complete return record
      return await this.returnRepository.getReturnWithItems(returnRecord.id!);
    } catch (error: any) {
      // Rollback only if the transaction is still active
      try {
        await transaction.rollback();
      } catch {
        // ignore double-rollback errors
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async getReturnById(id: string): Promise<IReturn | null> {
    try {
      return await this.returnRepository.getReturnWithItems(id);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getReturnsByUserId(userId: string): Promise<IReturn[]> {
    try {
      const returns = await this.returnRepository.findByUserId(userId);
      if (!returns || returns.length === 0) {
        return [];
      }
      const results = await Promise.all(
        returns.map(async (returnRecord) => {
          if (!returnRecord || !returnRecord.id) {
            return null;
          }
          return await this.returnRepository.getReturnWithItems(returnRecord.id);
        })
      );
      // Filter out any null results
      return results.filter((result): result is IReturn => result !== null);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getAllReturns(status?: string): Promise<IReturn[]> {
    try {
      const returns = await this.returnRepository.findAll(status);
      return await Promise.all(
        returns.map(async (returnRecord) => {
          return await this.returnRepository.getReturnWithItems(returnRecord.id!);
        })
      );
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async reviewReturn(reviewData: IReviewReturn): Promise<IReturn> {
    const transaction = await dbConnection.transaction();

    try {
      const returnRecord = await this.returnRepository.findById(reviewData.returnId);
      if (!returnRecord) {
        throw new HttpException(404, "Return not found");
      }

      if (returnRecord.status !== ReturnStatus.REQUESTED) {
        throw new HttpException(400, "Return is not in requested status");
      }

      const updateData: IUpdateReturn = {
        id: reviewData.returnId,
        reviewedBy: reviewData.reviewedBy,
      };

      if (reviewData.status === ReturnStatus.APPROVED) {
        updateData.status = ReturnStatus.APPROVED;

        // Calculate refund amount from return items
        const returnWithItems = await this.returnRepository.getReturnWithItems(reviewData.returnId);
        if (returnWithItems && returnWithItems.items) {
          let refundAmount = 0;
          for (const returnItem of returnWithItems.items) {
            const orderItem = await this.orderRepository.findOrderItemById(returnItem.orderItemId);
            if (orderItem) {
              const itemRefund = (parseFloat(orderItem.unitPrice.toString()) * returnItem.quantity);
              refundAmount += itemRefund;
            }
          }
          updateData.refundAmount = refundAmount;
          updateData.refundStatus = RefundStatus.PENDING;

          // Mark order and its items as having an approved return
          await Order.update(
            {
              isReturnRequested: true,
              isReturnApproved: true,
            },
            {
              where: { id: returnRecord.orderId },
              transaction,
            }
          );
          const orderItemIds = returnWithItems.items.map((item) => item.orderItemId);
          if (orderItemIds.length > 0) {
            await OrderItem.update(
              {
                isReturnRequested: true,
                isReturnApproved: true,
              },
              {
                where: { id: orderItemIds },
                transaction,
              }
            );
          }
        }
      } else if (reviewData.status === ReturnStatus.REJECTED) {
        updateData.status = ReturnStatus.REJECTED;
        updateData.rejectionReason = reviewData.rejectionReason || null;

        // Revert order status back to delivered
        await this.orderRepository.update({
          id: returnRecord.orderId,
          status: OrderStatus.DELIVERED,
        } as any);
        // Clear return approval flag on order (request flag remains for history)
        await Order.update(
          {
            isReturnApproved: false,
          },
          {
            where: { id: returnRecord.orderId },
            transaction,
          }
        );
        // Note: OrderItem status remains "delivered" - return status is tracked in ReturnItem
      } else {
        throw new HttpException(400, "Invalid review status. Must be approved or rejected");
      }

      const updatedReturn = await this.returnRepository.update(updateData);

      await transaction.commit();

      return await this.returnRepository.getReturnWithItems(updatedReturn.id!);
    } catch (error: any) {
      try {
        await transaction.rollback();
      } catch {
        // ignore double-rollback errors
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async reviewReturnItem(reviewData: IReviewReturnItem): Promise<IReturnItem> {
    try {
      const returnItem = await this.returnRepository.findReturnItemById(reviewData.returnItemId);
      if (!returnItem) {
        throw new HttpException(404, "Return item not found");
      }

      if (returnItem.status !== ReturnStatus.REQUESTED) {
        throw new HttpException(400, "Return item is not in requested status");
      }

      const updateData: Partial<IReturnItem> = {
        status: reviewData.status,
        reviewedBy: reviewData.reviewedBy,
      };

      if (reviewData.status === ReturnStatus.REJECTED) {
        updateData.rejectionReason = reviewData.rejectionReason || null;

        // Note: OrderItem status remains "delivered" - return status is tracked in ReturnItem
      } else if (reviewData.status === ReturnStatus.APPROVED) {
        // Note: OrderItem status remains "delivered" - return status is tracked in ReturnItem
      }

      const updatedItem = await this.returnRepository.updateReturnItem(reviewData.returnItemId, updateData);

      // Update return flags on the underlying order item
      if (updatedItem.orderItemId) {
        if (reviewData.status === ReturnStatus.APPROVED) {
          await OrderItem.update(
            {
              isReturnRequested: true,
              isReturnApproved: true,
            },
            {
              where: { id: updatedItem.orderItemId },
            }
          );
        } else if (reviewData.status === ReturnStatus.REJECTED) {
          await OrderItem.update(
            {
              isReturnApproved: false,
            },
            {
              where: { id: updatedItem.orderItemId },
            }
          );
        }
      }

      return updatedItem;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async updateReturnStatus(returnId: string, status: string, userId: string): Promise<IReturn> {
    try {
      const returnRecord = await this.returnRepository.findById(returnId);
      if (!returnRecord) {
        throw new HttpException(404, "Return not found");
      }

      // Validate status transition
      const currentStatus = returnRecord.status as ReturnStatus;
      const newStatus = status as ReturnStatus;

      const allowedTransitions: Record<ReturnStatus, ReturnStatus[]> = {
        [ReturnStatus.REQUESTED]: [ReturnStatus.APPROVED, ReturnStatus.REJECTED, ReturnStatus.CANCELLED],
        [ReturnStatus.APPROVED]: [ReturnStatus.IN_TRANSIT, ReturnStatus.CANCELLED],
        [ReturnStatus.REJECTED]: [], // Cannot transition from rejected
        [ReturnStatus.IN_TRANSIT]: [ReturnStatus.RECEIVED, ReturnStatus.CANCELLED],
        [ReturnStatus.RECEIVED]: [ReturnStatus.REFUND_PENDING, ReturnStatus.CANCELLED],
        [ReturnStatus.REFUND_PENDING]: [ReturnStatus.REFUNDED],
        [ReturnStatus.REFUNDED]: [], // Final state
        [ReturnStatus.CANCELLED]: [], // Cannot transition from cancelled
      };

      if (allowedTransitions[currentStatus] && !allowedTransitions[currentStatus].includes(newStatus)) {
        throw new HttpException(
          400,
          `Invalid status transition from ${currentStatus} to ${newStatus}`
        );
      }

      const updateData: IUpdateReturn = {
        id: returnId,
        status: newStatus,
      };

      // Handle status-specific logic
      if (newStatus === ReturnStatus.IN_TRANSIT) {
        // Update all return items to in_transit
        const returnWithItems = await this.returnRepository.getReturnWithItems(returnId);
        if (returnWithItems && returnWithItems.items) {
          for (const returnItem of returnWithItems.items) {
            await this.returnRepository.updateReturnItem(returnItem.id!, {
              status: ReturnStatus.IN_TRANSIT,
            });
            // Note: OrderItem status remains "delivered" - return status is tracked in ReturnItem
          }
        }
      } else if (newStatus === ReturnStatus.RECEIVED) {
        // Update all return items to received
        const returnWithItems = await this.returnRepository.getReturnWithItems(returnId);
        if (returnWithItems && returnWithItems.items) {
          for (const returnItem of returnWithItems.items) {
            await this.returnRepository.updateReturnItem(returnItem.id!, {
              status: ReturnStatus.RECEIVED,
            });
            // Note: OrderItem status remains "delivered" - return status is tracked in ReturnItem
          }
        }
      } else if (newStatus === ReturnStatus.REFUND_PENDING) {
        updateData.refundStatus = RefundStatus.PENDING;
      } else if (newStatus === ReturnStatus.REFUNDED) {
        updateData.refundStatus = RefundStatus.COMPLETED;

        // Update order payment status if all items refunded
        const returnWithItems = await this.returnRepository.getReturnWithItems(returnId);
        if (returnWithItems) {
          const order = await this.orderRepository.getOrderWithItems(returnWithItems.orderId);
          if (order && order.paymentStatus === PaymentStatus.PAID) {
            // Check if all items are returned by checking ReturnItem records
            const allItemsReturned = returnWithItems.items 
              ? returnWithItems.items.every(
                  (returnItem) => returnItem.status === ReturnStatus.REFUNDED
                )
              : false;
            if (allItemsReturned) {
              await this.orderRepository.update({
                id: returnWithItems.orderId,
                paymentStatus: PaymentStatus.REFUNDED,
                // Note: Order status remains "delivered" - return/refund status is tracked in Return model
              } as any);
            }
          }
        }
      }

      const updatedReturn = await this.returnRepository.update(updateData);

      return await this.returnRepository.getReturnWithItems(updatedReturn.id!);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async updateReturnItemStatus(returnItemId: string, status: string, userId: string): Promise<IReturnItem> {
    try {
      const returnItem = await this.returnRepository.findReturnItemById(returnItemId);
      if (!returnItem) {
        throw new HttpException(404, "Return item not found");
      }

      // Validate status transition
      const currentStatus = returnItem.status as ReturnStatus;
      const newStatus = status as ReturnStatus;

      const allowedTransitions: Record<ReturnStatus, ReturnStatus[]> = {
        [ReturnStatus.REQUESTED]: [ReturnStatus.APPROVED, ReturnStatus.REJECTED, ReturnStatus.CANCELLED],
        [ReturnStatus.APPROVED]: [ReturnStatus.IN_TRANSIT, ReturnStatus.CANCELLED],
        [ReturnStatus.REJECTED]: [],
        [ReturnStatus.IN_TRANSIT]: [ReturnStatus.RECEIVED, ReturnStatus.CANCELLED],
        [ReturnStatus.RECEIVED]: [ReturnStatus.REFUND_PENDING, ReturnStatus.CANCELLED],
        [ReturnStatus.REFUND_PENDING]: [ReturnStatus.REFUNDED],
        [ReturnStatus.REFUNDED]: [],
        [ReturnStatus.CANCELLED]: [],
      };

      if (allowedTransitions[currentStatus] && !allowedTransitions[currentStatus].includes(newStatus)) {
        throw new HttpException(
          400,
          `Invalid status transition from ${currentStatus} to ${newStatus}`
        );
      }

      const updateData: Partial<IReturnItem> = {
        status: newStatus,
      };

      // Note: OrderItem status remains "delivered" - return status is tracked in ReturnItem
      // No need to update OrderItem status since returns are handled separately

      return await this.returnRepository.updateReturnItem(returnItemId, updateData);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async cancelReturn(returnId: string, userId: string): Promise<IReturn> {
    try {
      const returnRecord = await this.returnRepository.findById(returnId);
      if (!returnRecord) {
        throw new HttpException(404, "Return not found");
      }

      if (returnRecord.userId !== userId) {
        throw new HttpException(403, "You do not have permission to cancel this return");
      }

      if (returnRecord.status === ReturnStatus.CANCELLED) {
        throw new HttpException(400, "Return is already cancelled");
      }

      if (
        returnRecord.status === ReturnStatus.REFUNDED ||
        returnRecord.status === ReturnStatus.REFUND_PENDING
      ) {
        throw new HttpException(400, "Cannot cancel return that is already refunded or pending refund");
      }

      // Update return status
      const updatedReturn = await this.returnRepository.update({
        id: returnId,
        status: ReturnStatus.CANCELLED,
      });

      // Revert order status back to delivered
      await this.orderRepository.update({
        id: returnRecord.orderId,
        status: OrderStatus.DELIVERED,
      } as any);

      // Clear approval flag on order (request flag remains true to indicate a historical request)
      await Order.update(
        {
          isReturnApproved: false,
        },
        {
          where: { id: returnRecord.orderId },
        }
      );

      // Revert all return items and clear approval flags
      const returnWithItems = await this.returnRepository.getReturnWithItems(returnId);
      if (returnWithItems && returnWithItems.items) {
        const orderItemIds = returnWithItems.items.map((item) => item.orderItemId);

        for (const returnItem of returnWithItems.items) {
          await this.returnRepository.updateReturnItem(returnItem.id!, {
            status: ReturnStatus.CANCELLED,
          });
          // Note: OrderItem status remains "delivered" - return status is tracked in ReturnItem
        }

        if (orderItemIds.length > 0) {
          await OrderItem.update(
            {
              isReturnApproved: false,
            },
            {
              where: { id: orderItemIds },
            }
          );
        }
      }

      return await this.returnRepository.getReturnWithItems(updatedReturn.id!);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }
}
