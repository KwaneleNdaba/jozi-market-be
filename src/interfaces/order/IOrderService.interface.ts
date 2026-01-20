import { Token } from "typedi";
import type { IOrder, ICreateOrder, IUpdateOrder } from "@/types/order.types";

export interface IOrderService {
  createOrder(userId: string, orderData: ICreateOrder): Promise<IOrder>;
  getOrderById(id: string): Promise<IOrder | null>;
  getOrderByOrderNumber(orderNumber: string): Promise<IOrder | null>;
  getOrdersByUserId(userId: string): Promise<IOrder[]>;
  getAllOrders(status?: string): Promise<IOrder[]>;
  updateOrder(updateData: IUpdateOrder): Promise<IOrder>;
}

export const ORDER_SERVICE_TOKEN = new Token<IOrderService>("IOrderService");
