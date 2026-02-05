import { Router } from "express";
import { CreateOrderDto, UpdateOrderDto, RequestCancellationDto, UpdateOrderItemStatusDto } from "@/dots/order/order.dot";
import { authorizationMiddleware, adminAuthorizationMiddleware, adminOrVendorAuthorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import { ValidationMiddleware } from "@/middlewares/ValidationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { OrderController } from "../../controllers/order/order.controller";

export class OrderRoute implements Routes {
  public path = "/order";
  public router = Router();
  public order = new OrderController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create order from cart (authenticated users only)
    this.router.post(
      `${this.path}`,
      authorizationMiddleware,
      ValidationMiddleware(CreateOrderDto),
      this.order.createOrder
    );

    // Get my orders (authenticated users only) - MUST come before /:id route
    this.router.get(
      `${this.path}/my-orders`,
      authorizationMiddleware,
      this.order.getMyOrders
    );

    // Get orders by vendor ID (grouped by date) - MUST come before /:id route
    this.router.get(
      `${this.path}/vendor/:vendorId`,
      adminOrVendorAuthorizationMiddleware,
      this.order.getOrdersByVendorId
    );

    // Get order items grouped by date and vendor (last 30 days) - MUST come before /:id route
    this.router.get(
      `${this.path}/items/grouped`,
      adminAuthorizationMiddleware,
      this.order.getOrderItemsGroupedByDateAndVendor
    );

    // Get order by order number (authenticated users only) - MUST come before /:id route
    this.router.get(
      `${this.path}/number/:orderNumber`,
      authorizationMiddleware,
      this.order.getOrderByOrderNumber
    );

    // Cancel order (authenticated users only) - MUST come before /:id route
    this.router.post(
      `${this.path}/cancellation`,
      authorizationMiddleware,
      ValidationMiddleware(RequestCancellationDto),
      this.order.requestCancellation
    );

    // Update order item status (vendor for their products, admin for any) - MUST come before /:id route
    this.router.put(
      `${this.path}/item/:orderItemId/status`,
      authorizationMiddleware,
      ValidationMiddleware(UpdateOrderItemStatusDto),
      this.order.updateOrderItemStatus
    );

    // Get order by ID (authenticated users only - can access own orders)
    // This must come AFTER all specific routes
    this.router.get(
      `${this.path}/:id`,
      authorizationMiddleware,
      this.order.getOrderById
    );

    // Get all orders (admin only)
    this.router.get(
      `${this.path}`,
      adminAuthorizationMiddleware,
      this.order.getAllOrders
    );

    // Update order (admin only)
    this.router.put(
      `${this.path}`,
      adminAuthorizationMiddleware,
      ValidationMiddleware(UpdateOrderDto),
      this.order.updateOrder
    );
  }
}
