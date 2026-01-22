import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  type IOrderRepository,
  ORDER_REPOSITORY_TOKEN,
} from "@/interfaces/order/IOrderRepository.interface";
import { Op } from "sequelize";
import Order from "@/models/order/order.model";
import OrderItem from "@/models/order-item/orderItem.model";
import Product from "@/models/product/product.model";
import ProductVariant from "@/models/product-variant/productVariant.model";
import User from "@/models/user/user.model";
import type { IOrder, IOrderItem, ICreateOrder, IUpdateOrder } from "@/types/order.types";

@Service({ id: ORDER_REPOSITORY_TOKEN })
export class OrderRepository implements IOrderRepository {
  public async create(orderData: ICreateOrder): Promise<IOrder> {
    try {
      // Generate unique order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const order = await Order.create({
        userId: orderData.userId,
        orderNumber,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        email: orderData.email,
        phone: orderData.phone || null,
        notes: orderData.notes || null,
        totalAmount: 0, // Will be calculated when items are added
        status: "pending",
        paymentStatus: "pending",
      } as any);

      return order.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<IOrder | null> {
    try {
      const order = await Order.findByPk(id, {
        include: [
          {
            model: User,
            as: "user",
            required: false,
            attributes: ["id", "fullName", "email", "phone", "role", "profileUrl", "address"],
          },
        ],
        raw: false,
      });
      return order ? order.get({ plain: true }) : null;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByOrderNumber(orderNumber: string): Promise<IOrder | null> {
    try {
      const order = await Order.findOne({
        where: { orderNumber },
        include: [
          {
            model: User,
            as: "user",
            required: false,
            attributes: ["id", "fullName", "email", "phone", "role", "profileUrl", "address"],
          },
        ],
        raw: false,
      });
      return order ? order.get({ plain: true }) : null;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByUserId(userId: string): Promise<IOrder[]> {
    try {
      const orders = await Order.findAll({
        where: { userId },
        include: [
          {
            model: User,
            as: "user",
            required: false,
            attributes: ["id", "fullName", "email", "phone", "role", "profileUrl", "address"],
          },
        ],
        order: [["createdAt", "DESC"]],
        raw: false,
      });
      return orders.map((order) => order.get({ plain: true }));
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(status?: string): Promise<IOrder[]> {
    try {
      const where: any = {};
      if (status) {
        where.status = status;
      }

      const orders = await Order.findAll({
        where,
        include: [
          {
            model: User,
            as: "user",
            required: false,
            attributes: ["id", "fullName", "email", "phone", "role", "profileUrl", "address"],
          },
        ],
        order: [["createdAt", "DESC"]],
        raw: false,
      });
      return orders.map((order) => order.get({ plain: true }));
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async update(updateData: IUpdateOrder): Promise<IOrder> {
    try {
      const order = await Order.findOne({
        where: { id: updateData.id },
        raw: false,
      });

      if (!order) {
        throw new HttpException(404, "Order not found");
      }

      const updatePayload: any = {};
      if (updateData.status !== undefined) updatePayload.status = updateData.status;
      if (updateData.paymentStatus !== undefined) updatePayload.paymentStatus = updateData.paymentStatus;
      if (updateData.notes !== undefined) updatePayload.notes = updateData.notes;
      if ((updateData as any).totalAmount !== undefined) updatePayload.totalAmount = (updateData as any).totalAmount;
      if ((updateData as any).orderNumber !== undefined) updatePayload.orderNumber = (updateData as any).orderNumber;
      // Return request fields
      if ((updateData as any).returnRequestStatus !== undefined) updatePayload.returnRequestStatus = (updateData as any).returnRequestStatus;
      if ((updateData as any).returnRequestedAt !== undefined) updatePayload.returnRequestedAt = (updateData as any).returnRequestedAt;
      if ((updateData as any).returnReviewedBy !== undefined) updatePayload.returnReviewedBy = (updateData as any).returnReviewedBy;
      if ((updateData as any).returnReviewedAt !== undefined) updatePayload.returnReviewedAt = (updateData as any).returnReviewedAt;
      if ((updateData as any).returnRejectionReason !== undefined) updatePayload.returnRejectionReason = (updateData as any).returnRejectionReason;
      // Cancellation request fields
      if ((updateData as any).cancellationRequestStatus !== undefined) updatePayload.cancellationRequestStatus = (updateData as any).cancellationRequestStatus;
      if ((updateData as any).cancellationRequestedAt !== undefined) updatePayload.cancellationRequestedAt = (updateData as any).cancellationRequestedAt;
      if ((updateData as any).cancellationReviewedBy !== undefined) updatePayload.cancellationReviewedBy = (updateData as any).cancellationReviewedBy;
      if ((updateData as any).cancellationReviewedAt !== undefined) updatePayload.cancellationReviewedAt = (updateData as any).cancellationReviewedAt;
      if ((updateData as any).cancellationRejectionReason !== undefined) updatePayload.cancellationRejectionReason = (updateData as any).cancellationRejectionReason;

      await order.update(updatePayload);
      return order.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async createOrderItem(
    orderId: string,
    itemData: Omit<IOrderItem, "id" | "orderId" | "createdAt" | "updatedAt">
  ): Promise<IOrderItem> {
    try {
      const orderItem = await OrderItem.create({
        orderId,
        productId: itemData.productId,
        productVariantId: itemData.productVariantId || null,
        quantity: itemData.quantity,
        unitPrice: itemData.unitPrice,
        totalPrice: itemData.totalPrice,
      } as any);
      return orderItem.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async getOrderWithItems(orderId: string): Promise<IOrder | null> {
    try {
      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: User,
            as: "user",
            required: false,
            attributes: ["id", "fullName", "email", "phone", "role", "profileUrl", "address"],
          },
          {
            model: OrderItem,
            as: "items",
            required: false,
            include: [
              {
                model: Product,
                as: "product",
                required: false,
              },
              {
                model: ProductVariant,
                as: "variant",
                required: false,
              },
            ],
          },
        ],
        raw: false,
      });

      return order ? order.get({ plain: true }) : null;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByVendorId(vendorId: string): Promise<IOrder[]> {
    try {
      // Find orders that have items with products belonging to the vendor
      // First, get all order items with products from this vendor
      const orderItems = await OrderItem.findAll({
        include: [
          {
            model: Product,
            as: "product",
            required: true,
            where: {
              userId: vendorId,
            },
            attributes: [], // Don't include product data in this query
          },
        ],
        attributes: ["orderId"],
        raw: false,
      });

      // Extract unique order IDs
      const orderIdsSet = new Set<string>();
      orderItems.forEach((item) => {
        const orderId = item.get("orderId") as string;
        if (orderId) {
          orderIdsSet.add(orderId);
        }
      });

      const orderIds = Array.from(orderIdsSet);

      if (orderIds.length === 0) {
        return [];
      }

      // Now fetch the full orders with all their items
      const orders = await Order.findAll({
        where: {
          id: {
            [Op.in]: orderIds,
          },
        },
        include: [
          {
            model: User,
            as: "user",
            required: false,
            attributes: ["id", "fullName", "email", "phone", "role", "profileUrl", "address"],
          },
          {
            model: OrderItem,
            as: "items",
            required: false,
            include: [
              {
                model: Product,
                as: "product",
                required: false,
              },
              {
                model: ProductVariant,
                as: "variant",
                required: false,
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
        raw: false,
      });

      return orders.map((order) => order.get({ plain: true }));
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findOrderItemById(orderItemId: string): Promise<IOrderItem | null> {
    try {
      const orderItem = await OrderItem.findByPk(orderItemId, {
        include: [
          {
            model: Product,
            as: "product",
            required: false,
          },
          {
            model: ProductVariant,
            as: "variant",
            required: false,
          },
        ],
        raw: false,
      });
      return orderItem ? orderItem.get({ plain: true }) : null;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async updateOrderItem(orderItemId: string, updateData: Partial<IOrderItem>): Promise<IOrderItem> {
    try {
      const orderItem = await OrderItem.findByPk(orderItemId);
      if (!orderItem) {
        throw new HttpException(404, "Order item not found");
      }

      const updatePayload: any = {};
      if (updateData.returnRequestStatus !== undefined) updatePayload.returnRequestStatus = updateData.returnRequestStatus;
      if (updateData.returnRequestedAt !== undefined) updatePayload.returnRequestedAt = updateData.returnRequestedAt;
      if (updateData.returnQuantity !== undefined) updatePayload.returnQuantity = updateData.returnQuantity;
      if (updateData.returnReason !== undefined) updatePayload.returnReason = updateData.returnReason;
      if (updateData.returnReviewedBy !== undefined) updatePayload.returnReviewedBy = updateData.returnReviewedBy;
      if (updateData.returnReviewedAt !== undefined) updatePayload.returnReviewedAt = updateData.returnReviewedAt;
      if (updateData.returnRejectionReason !== undefined) updatePayload.returnRejectionReason = updateData.returnRejectionReason;

      await orderItem.update(updatePayload);

      // Fetch updated order item with relations
      const updatedItem = await OrderItem.findByPk(orderItemId, {
        include: [
          {
            model: Product,
            as: "product",
            required: false,
          },
          {
            model: ProductVariant,
            as: "variant",
            required: false,
          },
        ],
        raw: false,
      });

      return updatedItem ? updatedItem.get({ plain: true }) : orderItem.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }
}
