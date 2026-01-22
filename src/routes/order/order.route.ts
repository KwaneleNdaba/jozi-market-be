import { Router } from "express";
import { CreateOrderDto, UpdateOrderDto, RequestReturnDto, RequestCancellationDto, ReviewReturnDto, ReviewCancellationDto, RequestItemReturnDto, ReviewItemReturnDto } from "@/dots/order/order.dot";
import { authorizationMiddleware, adminAuthorizationMiddleware } from "@/middlewares/authorizationMiddleware";
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
      authorizationMiddleware,
      this.order.getOrdersByVendorId
    );

    // Get order by order number (authenticated users only) - MUST come before /:id route
    this.router.get(
      `${this.path}/number/:orderNumber`,
      authorizationMiddleware,
      this.order.getOrderByOrderNumber
    );

    // Request return (authenticated users only) - MUST come before /:id route
    this.router.post(
      `${this.path}/return`,
      authorizationMiddleware,
      ValidationMiddleware(RequestReturnDto),
      this.order.requestReturn
    );

    // Request cancellation (authenticated users only) - MUST come before /:id route
    this.router.post(
      `${this.path}/cancellation`,
      authorizationMiddleware,
      ValidationMiddleware(RequestCancellationDto),
      this.order.requestCancellation
    );

    // Review return request (admin only) - MUST come before /:id route
    this.router.put(
      `${this.path}/return/review`,
      adminAuthorizationMiddleware,
      ValidationMiddleware(ReviewReturnDto),
      this.order.reviewReturn
    );

    // Review cancellation request (admin only) - MUST come before /:id route
    this.router.put(
      `${this.path}/cancellation/review`,
      adminAuthorizationMiddleware,
      ValidationMiddleware(ReviewCancellationDto),
      this.order.reviewCancellation
    );

    // Request item return (authenticated users only) - MUST come before /:id route
    this.router.post(
      `${this.path}/item/return`,
      authorizationMiddleware,
      ValidationMiddleware(RequestItemReturnDto),
      this.order.requestItemReturn
    );

    // Review item return request (admin only) - MUST come before /:id route
    this.router.put(
      `${this.path}/item/return/review`,
      adminAuthorizationMiddleware,
      ValidationMiddleware(ReviewItemReturnDto),
      this.order.reviewItemReturn
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
