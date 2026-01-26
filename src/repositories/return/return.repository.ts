import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  type IReturnRepository,
  RETURN_REPOSITORY_TOKEN,
} from "@/interfaces/return/IReturnRepository.interface";
import Return from "@/models/return/return.model";
import ReturnItem from "@/models/return-item/returnItem.model";
import Order from "@/models/order/order.model";
import OrderItem from "@/models/order-item/orderItem.model";
import User from "@/models/user/user.model";
import Product from "@/models/product/product.model";
import ProductVariant from "@/models/product-variant/productVariant.model";
import type {
  IReturn,
  IReturnItem,
  ICreateReturn,
  ICreateReturnItem,
  IUpdateReturn,
  IUpdateReturnItem,
} from "@/types/return.types";

@Service({ id: RETURN_REPOSITORY_TOKEN })
export class ReturnRepository implements IReturnRepository {
  public async create(returnData: ICreateReturn): Promise<IReturn> {
    try {
      const returnRecord = await Return.create({
        orderId: returnData.orderId,
        userId: returnData.userId,
        reason: returnData.reason,
        status: "requested",
        requestedAt: new Date(),
      } as any);

      return returnRecord.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<IReturn | null> {
    try {
      const returnRecord = await Return.findByPk(id, {
        include: [
          {
            model: User,
            as: "user",
            required: false,
            attributes: ["id", "fullName", "email", "phone", "role", "profileUrl", "address"],
          },
          {
            model: Order,
            as: "order",
            required: false,
            attributes: ["id", "orderNumber", "totalAmount", "status", "createdAt"],
          },
        ],
        raw: false,
      });
      return returnRecord ? returnRecord.get({ plain: true }) : null;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByOrderId(orderId: string): Promise<IReturn | null> {
    try {
      const returnRecord = await Return.findOne({
        where: { orderId },
        include: [
          {
            model: User,
            as: "user",
            required: false,
            attributes: ["id", "fullName", "email", "phone", "role", "profileUrl", "address"],
          },
          {
            model: Order,
            as: "order",
            required: false,
            attributes: ["id", "orderNumber", "totalAmount", "status", "createdAt"],
          },
        ],
        order: [["createdAt", "DESC"]],
        raw: false,
      });
      return returnRecord ? returnRecord.get({ plain: true }) : null;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByUserId(userId: string): Promise<IReturn[]> {
    try {
      const returns = await Return.findAll({
        where: { userId },
        include: [
          {
            model: User,
            as: "user",
            required: false,
            attributes: ["id", "fullName", "email", "phone", "role", "profileUrl", "address"],
          },
          {
            model: Order,
            as: "order",
            required: false,
            attributes: ["id", "orderNumber", "totalAmount", "status", "createdAt"],
          },
        ],
        order: [["createdAt", "DESC"]],
        raw: false,
      });
      return returns.map((returnRecord) => returnRecord.get({ plain: true }));
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(status?: string): Promise<IReturn[]> {
    try {
      const where: any = {};
      if (status) {
        where.status = status;
      }

      const returns = await Return.findAll({
        where,
        include: [
          {
            model: User,
            as: "user",
            required: false,
            attributes: ["id", "fullName", "email", "phone", "role", "profileUrl", "address"],
          },
          {
            model: Order,
            as: "order",
            required: false,
            attributes: ["id", "orderNumber", "totalAmount", "status", "createdAt"],
          },
        ],
        order: [["createdAt", "DESC"]],
        raw: false,
      });
      return returns.map((returnRecord) => returnRecord.get({ plain: true }));
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async update(updateData: IUpdateReturn): Promise<IReturn> {
    try {
      const returnRecord = await Return.findOne({
        where: { id: updateData.id },
        raw: false,
      });

      if (!returnRecord) {
        throw new HttpException(404, "Return not found");
      }

      const updatePayload: any = {};
      if (updateData.status !== undefined) updatePayload.status = updateData.status;
      if (updateData.reviewedBy !== undefined) updatePayload.reviewedBy = updateData.reviewedBy;
      if (updateData.rejectionReason !== undefined) updatePayload.rejectionReason = updateData.rejectionReason;
      if (updateData.refundAmount !== undefined) updatePayload.refundAmount = updateData.refundAmount;
      if (updateData.refundStatus !== undefined) updatePayload.refundStatus = updateData.refundStatus;

      if (updateData.reviewedBy) {
        updatePayload.reviewedAt = new Date();
      }

      await returnRecord.update(updatePayload);
      return returnRecord.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async createReturnItem(itemData: ICreateReturnItem): Promise<IReturnItem> {
    try {
      const returnItem = await ReturnItem.create({
        returnId: itemData.returnId,
        orderItemId: itemData.orderItemId,
        quantity: itemData.quantity,
        reason: itemData.reason || null,
        status: "requested",
        requestedAt: new Date(),
      } as any);
      return returnItem.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async getReturnWithItems(returnId: string): Promise<IReturn | null> {
    try {
      const returnRecord = await Return.findByPk(returnId, {
        include: [
          {
            model: User,
            as: "user",
            required: false,
            attributes: ["id", "fullName", "email", "phone", "role", "profileUrl", "address"],
          },
          {
            model: Order,
            as: "order",
            required: false,
            attributes: ["id", "orderNumber", "totalAmount", "status", "createdAt"],
          },
          {
            model: ReturnItem,
            as: "items",
            required: false,
            include: [
              {
                model: OrderItem,
                as: "orderItem",
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
          },
        ],
        raw: false,
      });

      return returnRecord ? returnRecord.get({ plain: true }) : null;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findReturnItemById(returnItemId: string): Promise<IReturnItem | null> {
    try {
      const returnItem = await ReturnItem.findByPk(returnItemId, {
        include: [
          {
            model: OrderItem,
            as: "orderItem",
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
      return returnItem ? returnItem.get({ plain: true }) : null;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async updateReturnItem(returnItemId: string, updateData: Partial<IReturnItem>): Promise<IReturnItem> {
    try {
      const returnItem = await ReturnItem.findByPk(returnItemId);
      if (!returnItem) {
        throw new HttpException(404, "Return item not found");
      }

      const updatePayload: any = {};
      if (updateData.status !== undefined) updatePayload.status = updateData.status;
      if (updateData.reviewedBy !== undefined) updatePayload.reviewedBy = updateData.reviewedBy;
      if (updateData.rejectionReason !== undefined) updatePayload.rejectionReason = updateData.rejectionReason;

      if (updateData.reviewedBy) {
        updatePayload.reviewedAt = new Date();
      }

      await returnItem.update(updatePayload);

      // Fetch updated return item with relations
      const updatedItem = await ReturnItem.findByPk(returnItemId, {
        include: [
          {
            model: OrderItem,
            as: "orderItem",
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

      return updatedItem ? updatedItem.get({ plain: true }) : returnItem.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async findReturnItemsByReturnId(returnId: string): Promise<IReturnItem[]> {
    try {
      const returnItems = await ReturnItem.findAll({
        where: { returnId },
        include: [
          {
            model: OrderItem,
            as: "orderItem",
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
      return returnItems.map((item) => item.get({ plain: true }));
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }
}
