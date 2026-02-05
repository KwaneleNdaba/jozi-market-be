import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { ORDER_SERVICE_TOKEN } from "@/interfaces/order/IOrderService.interface";
import type { CustomResponse } from "@/types/response.interface";
import type { IOrder, IRequestCancellation, IVendorOrdersResponse, IOrderItem, IOrderItemsGroupedResponse } from "@/types/order.types";

export class OrderController {
  private readonly orderService: any;

  constructor() {
    this.orderService = Container.get(ORDER_SERVICE_TOKEN);
  }

  public createOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new HttpException(401, "Unauthorized");
      }

      const orderData = req.body;
      const order = await this.orderService.createOrder(userId, orderData);

      const response: CustomResponse<IOrder> = {
        data: order,
        message: "Order created successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getOrderById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await this.orderService.getOrderById(id);

      if (!order) {
        throw new HttpException(404, "Order not found");
      }

      const response: CustomResponse<IOrder> = {
        data: order,
        message: "Order retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getOrderByOrderNumber = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { orderNumber } = req.params;
      const order = await this.orderService.getOrderByOrderNumber(orderNumber);

      if (!order) {
        throw new HttpException(404, "Order not found");
      }

      const response: CustomResponse<IOrder> = {
        data: order,
        message: "Order retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getMyOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new HttpException(401, "Unauthorized");
      }

      const orders = await this.orderService.getOrdersByUserId(userId);

      const response: CustomResponse<IOrder[]> = {
        data: orders,
        message: "Orders retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getAllOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { status } = req.query;
      const orders = await this.orderService.getAllOrders(status as string);

      const response: CustomResponse<IOrder[]> = {
        data: orders,
        message: "Orders retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updateData = req.body;
      const order = await this.orderService.updateOrder(updateData);

      const response: CustomResponse<IOrder> = {
        data: order,
        message: "Order updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public requestCancellation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestData = req.body;
      const order = await this.orderService.requestCancellation(requestData);

      const response: CustomResponse<IOrder> = {
        data: order,
        message: "Order cancelled successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getOrdersByVendorId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { vendorId } = req.params;
      if (!vendorId) {
        throw new HttpException(400, "Vendor ID is required");
      }

      const result = await this.orderService.getOrdersByVendorId(vendorId);

      const response: CustomResponse<IVendorOrdersResponse> = {
        data: result,
        message: "Vendor orders retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getOrderItemsGroupedByDateAndVendor = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const groupedData = await this.orderService.getOrderItemsGroupedByDateAndVendor();

      const response: CustomResponse<IOrderItemsGroupedResponse> = {
        data: groupedData,
        message: "Order items grouped by date and vendor retrieved successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateOrderItemStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { orderItemId } = req.params;
      const { status, rejectionReason } = req.body;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      if (!userId || !userRole) {
        throw new HttpException(401, "Unauthorized");
      }

      if (!status) {
        throw new HttpException(400, "Status is required");
      }

      // Require rejection reason when rejecting an item
      if (status === "rejected" && !rejectionReason) {
        throw new HttpException(400, "Rejection reason is required when rejecting an item");
      }

      const updatedItem = await this.orderService.updateOrderItemStatus(
        orderItemId,
        status,
        userId,
        userRole,
        rejectionReason
      );

      const response: CustomResponse<IOrderItem> = {
        data: updatedItem,
        message: "Order item status updated successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
