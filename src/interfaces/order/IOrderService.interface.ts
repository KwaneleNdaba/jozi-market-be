import { Token } from "typedi";
import type { IOrder, ICreateOrder, IUpdateOrder, IRequestCancellation, IReviewCancellation, IVendorOrdersResponse, IOrderItem, IOrderItemsGroupedResponse, OrderItemStatus } from "@/types/order.types";

export interface IOrderService {
  createOrder(userId: string, orderData: ICreateOrder): Promise<IOrder>;
  getOrderById(id: string): Promise<IOrder | null>;
  getOrderByOrderNumber(orderNumber: string): Promise<IOrder | null>;
  getOrdersByUserId(userId: string): Promise<IOrder[]>;
  getAllOrders(status?: string): Promise<IOrder[]>;
  updateOrder(updateData: IUpdateOrder): Promise<IOrder>;
  requestCancellation(requestData: IRequestCancellation): Promise<IOrder>;
  reviewCancellation(reviewData: IReviewCancellation): Promise<IOrder>;
  getOrdersByVendorId(vendorId: string): Promise<IVendorOrdersResponse>;
  getOrderItemsGroupedByDateAndVendor(): Promise<IOrderItemsGroupedResponse>;
  updateOrderItemStatus(orderItemId: string, status: OrderItemStatus | string, userId: string, userRole: string, rejectionReason?: string): Promise<IOrderItem>;
}

export const ORDER_SERVICE_TOKEN = new Token<IOrderService>("IOrderService");
