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
import VendorApplication from "@/models/vendor-application/vendorApplication.model";
import type { IOrder, IOrderItem, ICreateOrder, IUpdateOrder, IOrderItemWithDetails } from "@/types/order.types";

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
      // Cancellation request metadata fields
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
        status: (itemData as any).status || "pending",
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

      // Now fetch the full orders with only items that belong to this vendor
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
                required: true, // Only include items with products
                where: {
                  userId: vendorId, // Filter to only products from this vendor
                },
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
      if ((updateData as any).status !== undefined) updatePayload.status = (updateData as any).status;
      // Rejection fields
      if (updateData.rejectionReason !== undefined) updatePayload.rejectionReason = updateData.rejectionReason;
      if (updateData.rejectedBy !== undefined) updatePayload.rejectedBy = updateData.rejectedBy;
      if (updateData.rejectedAt !== undefined) updatePayload.rejectedAt = updateData.rejectedAt;

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

  public async findOrderItemsLast30Days(): Promise<IOrderItemWithDetails[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const orderItems = await OrderItem.findAll({
        where: {
          createdAt: {
            [Op.gte]: thirtyDaysAgo,
          },
        },
        include: [
          {
            model: Order,
            as: "order",
            required: true,
            include: [
              {
                model: User,
                as: "user",
                required: false,
                attributes: ["id", "fullName", "email", "phone", "role", "profileUrl", "address"],
              },
            ],
            attributes: ["id", "orderNumber", "createdAt"],
          },
          {
            model: Product,
            as: "product",
            required: true,
            include: [
              {
                model: User,
                as: "vendor",
                required: true,
                attributes: ["id"],
                include: [
                  {
                    model: VendorApplication,
                    as: "applicant",
                    required: false,
                    where: {
                      status: "approved",
                    },
                    order: [["submittedAt", "DESC"]],
                    limit: 1,
                    attributes: ["shopName", "contactPerson", "address"],
                  },
                ],
              },
            ],
            attributes: ["id", "title", "sku", "userId", "images"],
          },
        ],
        order: [["createdAt", "DESC"]],
        raw: false,
      });

      return orderItems.map((item) => {
        const itemData = item.get({ plain: true }) as any;
        
        // Extract vendor details from product's vendor application
        let vendorDetails = null;
        if (itemData.product?.vendor?.applicant) {
          const application = Array.isArray(itemData.product.vendor.applicant) 
            ? itemData.product.vendor.applicant[0] 
            : itemData.product.vendor.applicant;
          
          if (application) {
            vendorDetails = {
              vendorId: itemData.product.userId,
              vendorName: application.shopName,
              contactPerson: application.contactPerson,
              address: application.address,
            };
          }
        }

        // Extract customer details from order
        const customerDetails = itemData.order?.user || null;

        return {
          ...itemData,
          order: itemData.order ? {
            id: itemData.order.id,
            orderNumber: itemData.order.orderNumber,
            createdAt: itemData.order.createdAt,
            customer: customerDetails,
          } : undefined,
          product: itemData.product ? {
            id: itemData.product.id,
            title: itemData.product.title,
            sku: itemData.product.sku,
            images: itemData.product.images || [],
          } : undefined,
          vendor: vendorDetails,
        } as IOrderItemWithDetails;
      });
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }
}
