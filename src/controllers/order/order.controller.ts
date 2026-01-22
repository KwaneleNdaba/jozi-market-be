import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { ORDER_SERVICE_TOKEN } from "@/interfaces/order/IOrderService.interface";
import type { CustomResponse } from "@/types/response.interface";
import type { IOrder, IRequestReturn, IRequestCancellation, IReviewReturn, IReviewCancellation, IVendorOrdersResponse, IOrderItem } from "@/types/order.types";

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

  public requestReturn = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestData = req.body;
      const order = await this.orderService.requestReturn(requestData);

      const response: CustomResponse<IOrder> = {
        data: order,
        message: "Return request submitted successfully",
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
        message: "Cancellation request submitted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public reviewReturn = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const reviewData = req.body;
      const order = await this.orderService.reviewReturn(reviewData);

      const response: CustomResponse<IOrder> = {
        data: order,
        message: "Return request reviewed successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public reviewCancellation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const reviewData = req.body;
      const order = await this.orderService.reviewCancellation(reviewData);

      const response: CustomResponse<IOrder> = {
        data: order,
        message: "Cancellation request reviewed successfully",
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

  public requestItemReturn = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requestData = req.body;
      const orderItem = await this.orderService.requestItemReturn(requestData);

      const response: CustomResponse<IOrderItem> = {
        data: orderItem,
        message: "Item return request submitted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public reviewItemReturn = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const reviewData = req.body;
      const orderItem = await this.orderService.reviewItemReturn(reviewData);

      const response: CustomResponse<IOrderItem> = {
        data: orderItem,
        message: "Item return request reviewed successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
