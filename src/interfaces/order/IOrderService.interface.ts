import { Token } from "typedi";
import type { IOrder, ICreateOrder, IUpdateOrder, IRequestReturn, IRequestCancellation, IReviewReturn, IReviewCancellation, IVendorOrdersResponse, IRequestItemReturn, IReviewItemReturn, IOrderItem } from "@/types/order.types";

export interface IOrderService {
  createOrder(userId: string, orderData: ICreateOrder): Promise<IOrder>;
  getOrderById(id: string): Promise<IOrder | null>;
  getOrderByOrderNumber(orderNumber: string): Promise<IOrder | null>;
  getOrdersByUserId(userId: string): Promise<IOrder[]>;
  getAllOrders(status?: string): Promise<IOrder[]>;
  updateOrder(updateData: IUpdateOrder): Promise<IOrder>;
  requestReturn(requestData: IRequestReturn): Promise<IOrder>;
  requestCancellation(requestData: IRequestCancellation): Promise<IOrder>;
  reviewReturn(reviewData: IReviewReturn): Promise<IOrder>;
  reviewCancellation(reviewData: IReviewCancellation): Promise<IOrder>;
  getOrdersByVendorId(vendorId: string): Promise<IVendorOrdersResponse>;
  requestItemReturn(requestData: IRequestItemReturn): Promise<IOrderItem>;
  reviewItemReturn(reviewData: IReviewItemReturn): Promise<IOrderItem>;
}

export const ORDER_SERVICE_TOKEN = new Token<IOrderService>("IOrderService");
