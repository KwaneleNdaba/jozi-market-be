import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  type IOrderRepository,
  ORDER_REPOSITORY_TOKEN,
} from "@/interfaces/order/IOrderRepository.interface";
import Order from "@/models/order/order.model";
import OrderItem from "@/models/order-item/orderItem.model";
import Product from "@/models/product/product.model";
import ProductVariant from "@/models/product-variant/productVariant.model";
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
      const order = await Order.findByPk(id, { raw: true });
      return order;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByOrderNumber(orderNumber: string): Promise<IOrder | null> {
    try {
      const order = await Order.findOne({
        where: { orderNumber },
        raw: true,
      });
      return order;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByUserId(userId: string): Promise<IOrder[]> {
    try {
      const orders = await Order.findAll({
        where: { userId },
        raw: true,
        order: [["createdAt", "DESC"]],
      });
      return orders;
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
        raw: true,
        order: [["createdAt", "DESC"]],
      });
      return orders;
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
}
