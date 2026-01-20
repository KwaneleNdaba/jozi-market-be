import { Token } from "typedi";
import type { IOrder, IOrderItem, ICreateOrder, IUpdateOrder } from "@/types/order.types";

export interface IOrderRepository {
  create(orderData: ICreateOrder, orderNumber?: string): Promise<IOrder>;
  findById(id: string): Promise<IOrder | null>;
  findByOrderNumber(orderNumber: string): Promise<IOrder | null>;
  findByUserId(userId: string): Promise<IOrder[]>;
  findAll(status?: string): Promise<IOrder[]>;
  update(updateData: IUpdateOrder): Promise<IOrder>;
  createOrderItem(orderId: string, itemData: Omit<IOrderItem, "id" | "orderId" | "createdAt" | "updatedAt">): Promise<IOrderItem>;
  getOrderWithItems(orderId: string): Promise<IOrder | null>;
}

export const ORDER_REPOSITORY_TOKEN = new Token<IOrderRepository>("IOrderRepository");
