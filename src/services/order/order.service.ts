import { Inject, Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { type IOrderRepository, ORDER_REPOSITORY_TOKEN } from "@/interfaces/order/IOrderRepository.interface";
import { type IOrderService, ORDER_SERVICE_TOKEN } from "@/interfaces/order/IOrderService.interface";
import { CART_REPOSITORY_TOKEN } from "@/interfaces/cart/ICartRepository.interface";
import type { ICartRepository } from "@/interfaces/cart/ICartRepository.interface";
import { PRODUCT_REPOSITORY_TOKEN } from "@/interfaces/product/IProductRepository.interface";
import type { IProductRepository } from "@/interfaces/product/IProductRepository.interface";
import { PRODUCT_SERVICE_TOKEN } from "@/interfaces/product/IProductService.interface";
import type { IProductService } from "@/interfaces/product/IProductService.interface";
import type { IOrder, ICreateOrder, IUpdateOrder, IRequestReturn, IRequestCancellation, IReviewReturn, IReviewCancellation, IVendorOrdersResponse, IOrdersGroupedByDate, IRequestItemReturn, IReviewItemReturn, IOrderItem, IOrderItemsGroupedResponse, IOrderItemsByVendorAndDate, IOrderItemWithDetails } from "@/types/order.types";
import { OrderStatus, OrderItemStatus, PaymentStatus } from "@/types/order.types";
import Order from "@/models/order/order.model";
import dbConnection from "@/database";

@Service({ id: ORDER_SERVICE_TOKEN })
export class OrderService implements IOrderService {
  constructor(
    @Inject(ORDER_REPOSITORY_TOKEN) private readonly orderRepository: IOrderRepository,
    @Inject(CART_REPOSITORY_TOKEN) private readonly cartRepository: ICartRepository,
    @Inject(PRODUCT_REPOSITORY_TOKEN) private readonly productRepository: IProductRepository,
    @Inject(PRODUCT_SERVICE_TOKEN) private readonly productService: IProductService
  ) {}

  /**
   * Calculate order status based on order items statuses
   * Rules:
   * - order.status = delivered when ALL active items are delivered
   * - order.status = shipped when order is shipped (consolidated shipment)
   * - order.status = ready_to_ship when every item is packed/shipped OR cancelled/rejected
   * - order.status = processing when at least one item is accepted/processing/picked (vendor is working on it)
   * - order.status = confirmed when at least one item is accepted but none are processing yet
   * - order.status = cancelled when all items are cancelled/rejected
   */
  private async calculateOrderStatus(orderId: string): Promise<OrderStatus> {
    const order = await this.orderRepository.getOrderWithItems(orderId);
    if (!order || !order.items || order.items.length === 0) {
      return OrderStatus.PENDING;
    }

    const items = order.items;
    const activeItems = items.filter(
      (item) => item.status !== OrderItemStatus.CANCELLED && item.status !== OrderItemStatus.REJECTED
    );
    const allCancelledOrRejected = items.every(
      (item) => item.status === OrderItemStatus.CANCELLED || item.status === OrderItemStatus.REJECTED
    );
    const allPackedOrShipped = items.every(
      (item) =>
        item.status === OrderItemStatus.PACKED ||
        item.status === OrderItemStatus.SHIPPED ||
        item.status === OrderItemStatus.DELIVERED ||
        item.status === OrderItemStatus.CANCELLED ||
        item.status === OrderItemStatus.REJECTED
    );
    const allDelivered = activeItems.length > 0 && activeItems.every(
      (item) => item.status === OrderItemStatus.DELIVERED
    );
    const hasActiveItems = activeItems.length > 0;

    // If all items are cancelled/rejected, order is cancelled
    if (allCancelledOrRejected) {
      return OrderStatus.CANCELLED;
    }

    // If all active items are delivered, order is delivered
    if (allDelivered) {
      return OrderStatus.DELIVERED;
    }

    // If all items are packed/shipped (or cancelled/rejected) and there are active items, ready to ship
    if (allPackedOrShipped && hasActiveItems) {
      return OrderStatus.READY_TO_SHIP;
    }

    // Check if any items are in return flow
    const hasReturnItems = items.some(
      (item) =>
        item.status === OrderItemStatus.RETURN_REQUESTED ||
        item.status === OrderItemStatus.RETURN_APPROVED ||
        item.status === OrderItemStatus.RETURN_IN_TRANSIT ||
        item.status === OrderItemStatus.RETURN_RECEIVED
    );

    if (hasReturnItems) {
      return OrderStatus.RETURN_IN_PROGRESS;
    }

    // Check if any items are in processing states (processing, picked)
    // This means vendor is actively working on the order
    const hasProcessingItems = activeItems.some(
      (item) =>
        item.status === OrderItemStatus.PROCESSING ||
        item.status === OrderItemStatus.PICKED
    );

    if (hasProcessingItems) {
      return OrderStatus.PROCESSING;
    }

    // Check if at least one item is accepted (vendor accepted the order)
    const hasAcceptedItems = activeItems.some(
      (item) => item.status === OrderItemStatus.ACCEPTED
    );

    if (hasAcceptedItems) {
      return OrderStatus.CONFIRMED;
    }

    // If all items are still pending, order is pending
    const allPending = activeItems.length > 0 && activeItems.every(
      (item) => item.status === OrderItemStatus.PENDING
    );

    if (allPending) {
      return OrderStatus.PENDING;
    }

    // Default to processing if we have active items but unclear state
    return hasActiveItems ? OrderStatus.PROCESSING : OrderStatus.PENDING;
  }

  public async createOrder(userId: string, orderData: ICreateOrder): Promise<IOrder> {
    const transaction = await dbConnection.transaction();

    try {
      // Get user's cart
      const cart = await this.cartRepository.getCartWithItems(userId);
      if (!cart || !cart.items || cart.items.length === 0) {
        throw new HttpException(400, "Cart is empty");
      }

      // Create order (order number will be generated by repository)
      const order = await this.orderRepository.create(orderData);

      let totalAmount = 0;

      // Process each cart item and create order items
      for (const cartItem of cart.items) {
        // Verify product still exists and is active
        const product = await this.productRepository.findById(cartItem.productId);
        if (!product) {
          await transaction.rollback();
          throw new HttpException(404, `Product ${cartItem.productId} not found`);
        }

        if (product.status !== "Active") {
          await transaction.rollback();
          throw new HttpException(400, `Product ${product.title} is not available`);
        }

        // Determine price and stock check
        let unitPrice: number;
        let availableStock: number;

        if (cartItem.productVariantId) {
          const variant = product.variants?.find((v: any) => v.id === cartItem.productVariantId);
          if (!variant) {
            await transaction.rollback();
            throw new HttpException(404, `Product variant ${cartItem.productVariantId} not found`);
          }
          if (variant.status !== "Active") {
            await transaction.rollback();
            throw new HttpException(400, `Product variant is not available`);
          }
          // Use variant price (discount price if available, otherwise regular price)
          const variantPrice = variant.discountPrice || variant.price;
          unitPrice = typeof variantPrice === 'string' ? parseFloat(variantPrice) : variantPrice;
          availableStock = variant.stock;
        } else {
          // Use product price (discount price if available, otherwise regular price)
          // Product from repository has flat structure with regularPrice, discountPrice, initialStock
          const productPrice = (product as any).discountPrice || (product as any).regularPrice;
          unitPrice = typeof productPrice === 'string' ? parseFloat(productPrice) : productPrice;
          availableStock = (product as any).initialStock || 0;
        }

        // Check stock availability
        if (availableStock < cartItem.quantity) {
          await transaction.rollback();
          throw new HttpException(400, `Insufficient stock for ${product.title}`);
        }

        const totalPrice = unitPrice * cartItem.quantity;
        totalAmount += totalPrice;

        // Create order item
        await this.orderRepository.createOrderItem(order.id!, {
          productId: cartItem.productId,
          productVariantId: cartItem.productVariantId || null,
          quantity: cartItem.quantity,
          unitPrice,
          totalPrice,
        });
      }

      // Update order total amount using transaction
      await Order.update(
        { totalAmount },
        {
          where: { id: order.id! },
          transaction,
        }
      );

      // Clear cart after successful order creation
      await this.cartRepository.clearCart(cart.id!);

      await transaction.commit();

      // Fetch order with items
      const orderWithItems = await this.orderRepository.getOrderWithItems(order.id!);

      // Enrich order items with product details (with signed URLs)
      if (orderWithItems && orderWithItems.items) {
        const enrichedItems = await Promise.all(
          orderWithItems.items.map(async (item) => {
            const product = await this.productService.getProductById(item.productId);
            return {
              ...item,
              product: product || undefined,
            };
          })
        );
        orderWithItems.items = enrichedItems;
      }

      return orderWithItems!;
    } catch (error: any) {
      await transaction.rollback();
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async getOrderById(id: string): Promise<IOrder | null> {
    try {
      const order = await this.orderRepository.getOrderWithItems(id);
      if (!order) {
        return null;
      }

      // Enrich order items with product details (with signed URLs)
      if (order.items) {
        const enrichedItems = await Promise.all(
          order.items.map(async (item) => {
            const product = await this.productService.getProductById(item.productId);
            return {
              ...item,
              product: product || undefined,
            };
          })
        );
        order.items = enrichedItems;
      }

      return order;
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getOrderByOrderNumber(orderNumber: string): Promise<IOrder | null> {
    try {
      const order = await this.orderRepository.findByOrderNumber(orderNumber);
      if (!order) {
        return null;
      }

      const orderWithItems = await this.orderRepository.getOrderWithItems(order.id!);

      // Enrich order items with product details (with signed URLs)
      if (orderWithItems && orderWithItems.items) {
        const enrichedItems = await Promise.all(
          orderWithItems.items.map(async (item) => {
            const product = await this.productService.getProductById(item.productId);
            return {
              ...item,
              product: product || undefined,
            };
          })
        );
        orderWithItems.items = enrichedItems;
      }

      return orderWithItems;
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getOrdersByUserId(userId: string): Promise<IOrder[]> {
    try {
      const orders = await this.orderRepository.findByUserId(userId);

      if (!orders || orders.length === 0) {
        return [];
      }

      // Enrich each order with items (with signed URLs)
      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          const orderWithItems = await this.orderRepository.getOrderWithItems(order.id!);
          
          if (!orderWithItems) {
            // If order not found with items, return the basic order with empty items array
            return {
              ...order,
              items: [],
            };
          }

          // Enrich items with product details (with signed URLs)
          if (orderWithItems.items && orderWithItems.items.length > 0) {
            const enrichedItems = await Promise.all(
              orderWithItems.items.map(async (item) => {
                try {
                  const product = await this.productService.getProductById(item.productId);
                  return {
                    ...item,
                    product: product || undefined,
                  };
                } catch (error) {
                  // If product fetch fails, return item without product
                  return {
                    ...item,
                    product: undefined,
                  };
                }
              })
            );
            orderWithItems.items = enrichedItems;
          } else {
            // Ensure items array exists even if empty
            orderWithItems.items = [];
          }

          return orderWithItems;
        })
      );

      return enrichedOrders;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async getAllOrders(status?: string): Promise<IOrder[]> {
    try {
      const orders = await this.orderRepository.findAll(status);

      // Enrich each order with items (with signed URLs)
      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          const orderWithItems = await this.orderRepository.getOrderWithItems(order.id!);
          
          // Ensure user details are preserved (from either order or orderWithItems)
          const userDetails = orderWithItems?.user || order.user;
          
          if (orderWithItems && orderWithItems.items) {
            const enrichedItems = await Promise.all(
              orderWithItems.items.map(async (item) => {
                const product = await this.productService.getProductById(item.productId);
                return {
                  ...item,
                  product: product || undefined,
                };
              })
            );
            orderWithItems.items = enrichedItems;
          }
          
          // Return orderWithItems with user details, or fallback to order with user details
          const finalOrder = orderWithItems || order;
          
          // Ensure user details are included
          if (userDetails && !finalOrder.user) {
            finalOrder.user = userDetails;
          }
          
          return finalOrder;
        })
      );

      return enrichedOrders;
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async updateOrder(updateData: IUpdateOrder): Promise<IOrder> {
    try {
      const order = await this.orderRepository.findById(updateData.id);
      if (!order) {
        throw new HttpException(404, "Order not found");
      }

      // If status is being updated, validate the transition
      if (updateData.status && updateData.status !== order.status) {
        const currentStatus = order.status as OrderStatus;
        const newStatus = updateData.status as OrderStatus;

        // Define allowed status transitions
        const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
          [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
          [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
          [OrderStatus.PROCESSING]: [OrderStatus.READY_TO_SHIP, OrderStatus.CANCELLED],
          [OrderStatus.READY_TO_SHIP]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
          [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
          [OrderStatus.DELIVERED]: [OrderStatus.RETURN_IN_PROGRESS],
          [OrderStatus.CANCELLED]: [], // Cannot transition from cancelled
          [OrderStatus.RETURN_IN_PROGRESS]: [OrderStatus.RETURNED, OrderStatus.DELIVERED], // Can revert if return rejected
          [OrderStatus.RETURNED]: [OrderStatus.REFUND_PENDING],
          [OrderStatus.REFUND_PENDING]: [OrderStatus.REFUNDED],
          [OrderStatus.REFUNDED]: [], // Final state
        };

        // Validate transition
        if (allowedTransitions[currentStatus] && !allowedTransitions[currentStatus].includes(newStatus)) {
          throw new HttpException(
            400,
            `Invalid status transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedTransitions[currentStatus].join(", ")}`
          );
        }

        // Special case: If setting to DELIVERED, verify all items are delivered
        if (newStatus === OrderStatus.DELIVERED) {
          const orderWithItems = await this.orderRepository.getOrderWithItems(order.id!);
          if (orderWithItems && orderWithItems.items) {
            const activeItems = orderWithItems.items.filter(
              (item) => item.status !== OrderItemStatus.CANCELLED && item.status !== OrderItemStatus.REJECTED
            );
            const allItemsDelivered = activeItems.length > 0 && activeItems.every(
              (item) => item.status === OrderItemStatus.DELIVERED
            );
            
            if (!allItemsDelivered) {
              throw new HttpException(
                400,
                "Cannot set order to delivered. All active order items must be delivered first."
              );
            }
          }
        }
      }

      // If status is not explicitly set, recalculate based on items
      if (!updateData.status) {
        const calculatedStatus = await this.calculateOrderStatus(order.id!);
        updateData.status = calculatedStatus;
      }

      const updatedOrder = await this.orderRepository.update(updateData);

      // Fetch order with items
      const orderWithItems = await this.orderRepository.getOrderWithItems(updatedOrder.id!);

      // Enrich order items with product details
      if (orderWithItems && orderWithItems.items) {
        const enrichedItems = await Promise.all(
          orderWithItems.items.map(async (item) => {
            const product = await this.productRepository.findById(item.productId);
            return {
              ...item,
              product: product || undefined,
            };
          })
        );
        orderWithItems.items = enrichedItems;
      }

      return orderWithItems!;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async requestReturn(requestData: IRequestReturn): Promise<IOrder> {
    try {
      const order = await this.orderRepository.findById(requestData.orderId);
      if (!order) {
        throw new HttpException(404, "Order not found");
      }

      // Only delivered orders can request returns
      if (order.status !== OrderStatus.DELIVERED) {
        throw new HttpException(400, "Only delivered orders can request returns");
      }

      // Check if return already in progress
      if (order.returnRequestedAt) {
        throw new HttpException(400, "Return request already exists for this order");
      }

      const updatedOrder = await this.orderRepository.update({
        id: requestData.orderId,
        status: OrderStatus.RETURN_IN_PROGRESS,
        returnRequestedAt: new Date(),
        notes: requestData.reason ? `${order.notes || ''}\nReturn reason: ${requestData.reason}`.trim() : order.notes,
      } as any);

      return await this.getOrderById(updatedOrder.id!);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async requestCancellation(requestData: IRequestCancellation): Promise<IOrder> {
    try {
      const order = await this.orderRepository.findById(requestData.orderId);
      if (!order) {
        throw new HttpException(404, "Order not found");
      }

      // Only pending, confirmed, or processing orders can request cancellation
      if (
        order.status !== OrderStatus.PENDING &&
        order.status !== OrderStatus.CONFIRMED &&
        order.status !== OrderStatus.PROCESSING
      ) {
        throw new HttpException(400, "Only pending, confirmed, or processing orders can request cancellation");
      }

      // Check if cancellation already requested
      if (order.cancellationRequestedAt) {
        throw new HttpException(400, "Cancellation request already exists for this order");
      }

      const updatedOrder = await this.orderRepository.update({
        id: requestData.orderId,
        cancellationRequestedAt: new Date(),
        notes: requestData.reason ? `${order.notes || ''}\nCancellation reason: ${requestData.reason}`.trim() : order.notes,
      } as any);

      return await this.getOrderById(updatedOrder.id!);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async reviewReturn(reviewData: IReviewReturn): Promise<IOrder> {
    try {
      const order = await this.orderRepository.findById(reviewData.orderId);
      if (!order) {
        throw new HttpException(404, "Order not found");
      }

      if (!order.returnRequestedAt || order.status !== OrderStatus.RETURN_IN_PROGRESS) {
        throw new HttpException(400, "No pending return request found for this order");
      }

      const updateData: any = {
        id: reviewData.orderId,
        returnReviewedBy: reviewData.reviewedBy,
        returnReviewedAt: new Date(),
        returnRejectionReason: reviewData.rejectionReason || null,
      };

      // Update order status based on review
      if (reviewData.status === OrderStatus.RETURNED) {
        updateData.status = OrderStatus.RETURNED;
      } else if (reviewData.status === OrderStatus.REFUND_PENDING) {
        updateData.status = OrderStatus.REFUND_PENDING;
      } else {
        // Rejected - revert to delivered
        updateData.status = OrderStatus.DELIVERED;
        updateData.returnRejectionReason = reviewData.rejectionReason || null;
      }

      const updatedOrder = await this.orderRepository.update(updateData);

      return await this.getOrderById(updatedOrder.id!);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async reviewCancellation(reviewData: IReviewCancellation): Promise<IOrder> {
    try {
      const order = await this.orderRepository.findById(reviewData.orderId);
      if (!order) {
        throw new HttpException(404, "Order not found");
      }

      if (!order.cancellationRequestedAt) {
        throw new HttpException(400, "No pending cancellation request found for this order");
      }

      const updateData: any = {
        id: reviewData.orderId,
        cancellationReviewedBy: reviewData.reviewedBy,
        cancellationReviewedAt: new Date(),
        cancellationRejectionReason: reviewData.rejectionReason || null,
      };

      // Update order status based on review
      if (reviewData.status === OrderStatus.CANCELLED) {
        updateData.status = OrderStatus.CANCELLED;
      } else {
        // Rejected - revert to previous status (could be pending, confirmed, or processing)
        updateData.status = OrderStatus.PROCESSING;
        updateData.cancellationRejectionReason = reviewData.rejectionReason || null;
      }

      const updatedOrder = await this.orderRepository.update(updateData);

      return await this.getOrderById(updatedOrder.id!);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async getOrdersByVendorId(vendorId: string): Promise<IVendorOrdersResponse> {
    try {
      // Get all orders that contain products from this vendor
      const orders = await this.orderRepository.findByVendorId(vendorId);

      if (!orders || orders.length === 0) {
        return {
          vendorId,
          groupedOrders: [],
          totalOrders: 0,
          totalAmount: 0,
        };
      }

      // Enrich each order with items and products (with signed URLs)
      // Note: orders from findByVendorId already have filtered items (only vendor's items)
      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          // Use the order from findByVendorId which already has filtered items
          // But we need to enrich the products with signed URLs
          if (!order.items || order.items.length === 0) {
            return {
              ...order,
              items: [],
              totalAmount: 0, // Recalculate total for vendor items only
            };
          }

          // Items are already filtered by repository to only include vendor's products
          // Now enrich with product details (with signed URLs)
          const enrichedItems = await Promise.all(
            order.items.map(async (item) => {
              try {
                const product = await this.productService.getProductById(item.productId);
                // Verify product belongs to vendor (safety check)
                if (product && (product as any).userId !== vendorId) {
                  return null; // Skip items not belonging to vendor (shouldn't happen, but safety check)
                }
                return {
                  ...item,
                  product: product || undefined,
                };
              } catch (error) {
                // If product fetch fails, skip this item
                return null;
              }
            })
          );

          // Filter out null items (safety check)
          const validItems = enrichedItems.filter((item) => item !== null) as IOrderItem[];

          // Recalculate total amount for vendor items only
          const vendorTotalAmount = validItems.reduce((sum, item) => {
            return sum + parseFloat(item.totalPrice.toString());
          }, 0);

          return {
            ...order,
            items: validItems,
            totalAmount: vendorTotalAmount, // Override with vendor-specific total
          };
        })
      );

      // Group orders by date (YYYY-MM-DD format)
      const ordersByDate = new Map<string, IOrder[]>();
      
      enrichedOrders.forEach((order) => {
        if (order.createdAt) {
          const date = new Date(order.createdAt);
          const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
          
          if (!ordersByDate.has(dateKey)) {
            ordersByDate.set(dateKey, []);
          }
          ordersByDate.get(dateKey)!.push(order);
        }
      });

      // Convert map to array and calculate totals for each date group
      // Note: totalAmount here is already vendor-specific (calculated above)
      const groupedOrders: IOrdersGroupedByDate[] = Array.from(ordersByDate.entries())
        .map(([date, orders]) => {
          const totalAmount = orders.reduce((sum, order) => {
            return sum + parseFloat(order.totalAmount.toString());
          }, 0);

          return {
            date,
            orders: orders.sort((a, b) => {
              // Sort orders within each date by createdAt (newest first)
              const dateA = new Date(a.createdAt || 0).getTime();
              const dateB = new Date(b.createdAt || 0).getTime();
              return dateB - dateA;
            }),
            totalOrders: orders.length,
            totalAmount, // This is vendor-specific total
          };
        })
        .sort((a, b) => {
          // Sort date groups by date (newest first)
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

      // Calculate overall totals (vendor-specific)
      const totalOrders = enrichedOrders.length;
      const totalAmount = enrichedOrders.reduce((sum, order) => {
        return sum + parseFloat(order.totalAmount.toString());
      }, 0);

      return {
        vendorId,
        groupedOrders,
        totalOrders,
        totalAmount,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async requestItemReturn(requestData: IRequestItemReturn): Promise<IOrderItem> {
    try {
      // Verify order exists and belongs to user
      const order = await this.orderRepository.findById(requestData.orderId);
      if (!order) {
        throw new HttpException(404, "Order not found");
      }

      // Only delivered orders can have items returned
      if (order.status !== "delivered") {
        throw new HttpException(400, "Only delivered orders can have items returned");
      }

      // Get the order item
      const orderItem = await this.orderRepository.findOrderItemById(requestData.orderItemId);
      if (!orderItem) {
        throw new HttpException(404, "Order item not found");
      }

      // Verify the item belongs to the order
      if (orderItem.orderId !== requestData.orderId) {
        throw new HttpException(400, "Order item does not belong to this order");
      }

      // Check if return already requested
      if (orderItem.status === OrderItemStatus.RETURN_REQUESTED || orderItem.returnRequestedAt) {
        throw new HttpException(400, "Return request already exists for this item");
      }

      // Validate return quantity
      if (requestData.returnQuantity <= 0 || requestData.returnQuantity > orderItem.quantity) {
        throw new HttpException(400, `Return quantity must be between 1 and ${orderItem.quantity}`);
      }

      // Update order item with return request
      const updatedItem = await this.orderRepository.updateOrderItem(requestData.orderItemId, {
        status: OrderItemStatus.RETURN_REQUESTED,
        returnRequestedAt: new Date(),
        returnQuantity: requestData.returnQuantity,
        returnReason: requestData.reason || null,
      } as any);

      return updatedItem;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async reviewItemReturn(reviewData: IReviewItemReturn): Promise<IOrderItem> {
    try {
      // Verify order exists
      const order = await this.orderRepository.findById(reviewData.orderId);
      if (!order) {
        throw new HttpException(404, "Order not found");
      }

      // Get the order item
      const orderItem = await this.orderRepository.findOrderItemById(reviewData.orderItemId);
      if (!orderItem) {
        throw new HttpException(404, "Order item not found");
      }

      // Verify the item belongs to the order
      if (orderItem.orderId !== reviewData.orderId) {
        throw new HttpException(400, "Order item does not belong to this order");
      }

      if (orderItem.status !== OrderItemStatus.RETURN_REQUESTED || !orderItem.returnRequestedAt) {
        throw new HttpException(400, "No pending return request found for this item");
      }

      // Update order item with review decision
      const updatedItem = await this.orderRepository.updateOrderItem(reviewData.orderItemId, {
        status: reviewData.status as OrderItemStatus,
        returnReviewedBy: reviewData.reviewedBy,
        returnReviewedAt: new Date(),
        returnRejectionReason:
          reviewData.status === OrderItemStatus.RETURN_REJECTED ? reviewData.rejectionReason : null,
      } as any);

      return updatedItem;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async getOrderItemsGroupedByDateAndVendor(): Promise<IOrderItemsGroupedResponse> {
    try {
      let orderItems = await this.orderRepository.findOrderItemsLast30Days();

      // Enrich products with signed URLs for images
      if (orderItems && orderItems.length > 0) {
        orderItems = await Promise.all(
          orderItems.map(async (item) => {
            if (item.product?.id) {
              try {
                const enrichedProduct = await this.productService.getProductById(item.product.id);
                if (enrichedProduct && enrichedProduct.images) {
                  item.product.images = enrichedProduct.images;
                }
              } catch (error) {
                // If product enrichment fails, keep original product data
                console.error(`Failed to enrich product ${item.product.id}:`, error);
              }
            }
            return item;
          })
        );
      }

      if (!orderItems || orderItems.length === 0) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const today = new Date();

        return {
          groupedItems: [],
          totalItems: 0,
          totalAmount: 0,
          dateRange: {
            startDate: thirtyDaysAgo.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0],
          },
        };
      }

      // Group by date and vendor
      const groupedMap = new Map<string, Map<string, IOrderItemWithDetails[]>>();

      orderItems.forEach((item) => {
        if (!item.vendor || !item.order) {
          return; // Skip items without vendor or order details
        }

        // Get date in YYYY-MM-DD format
        const orderDate = new Date(item.order.createdAt);
        const dateKey = orderDate.toISOString().split('T')[0];
        const vendorId = item.vendor.vendorId;

        // Initialize date group if it doesn't exist
        if (!groupedMap.has(dateKey)) {
          groupedMap.set(dateKey, new Map());
        }

        const dateGroup = groupedMap.get(dateKey)!;

        // Initialize vendor group if it doesn't exist
        if (!dateGroup.has(vendorId)) {
          dateGroup.set(vendorId, []);
        }

        // Add item to vendor group
        dateGroup.get(vendorId)!.push(item);
      });

      // Convert to array format
      const groupedItems: IOrderItemsByVendorAndDate[] = [];

      groupedMap.forEach((vendorMap, date) => {
        vendorMap.forEach((items, vendorId) => {
          if (items.length > 0) {
            const vendor = items[0].vendor!;
            const totalAmount = items.reduce((sum, item) => sum + Number(item.totalPrice), 0);

            groupedItems.push({
              date,
              vendor: {
                vendorId: vendor.vendorId,
                vendorName: vendor.vendorName,
                contactPerson: vendor.contactPerson,
                address: vendor.address,
              },
              orderItems: items,
              totalItems: items.length,
              totalAmount,
            });
          }
        });
      });

      // Sort by date (newest first), then by vendor name
      groupedItems.sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return a.vendor.vendorName.localeCompare(b.vendor.vendorName);
      });

      // Calculate totals
      const totalItems = orderItems.length;
      const totalAmount = orderItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);

      // Get date range
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const today = new Date();

      return {
        groupedItems,
        totalItems,
        totalAmount,
        dateRange: {
          startDate: thirtyDaysAgo.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        },
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async updateOrderItemStatus(
    orderItemId: string,
    status: OrderItemStatus | string,
    userId: string,
    userRole: string,
    rejectionReason?: string
  ): Promise<IOrderItem> {
    try {
      // Get the order item with product details
      const orderItem = await this.orderRepository.findOrderItemById(orderItemId);
      if (!orderItem) {
        throw new HttpException(404, "Order item not found");
      }

      // Get the product to check ownership
      const product = await this.productRepository.findById(orderItem.productId);
      if (!product) {
        throw new HttpException(404, "Product not found");
      }

      // Authorization check: Admin can update any item, Vendor can only update items for their products
      if (userRole !== "admin" && product.userId !== userId) {
        throw new HttpException(403, "You do not have permission to update this order item");
      }

      // Validate status transitions (basic validation)
      const currentStatus = orderItem.status as OrderItemStatus;
      const newStatus = status as OrderItemStatus;

      // Prevent vendors from setting status to "delivered" - only admins can do this
      if (userRole !== "admin" && newStatus === OrderItemStatus.DELIVERED) {
        throw new HttpException(
          403,
          "Vendors cannot set order item status to 'delivered'. Only administrators can mark items as delivered."
        );
      }

      // Define allowed status transitions
      const allowedTransitions: Record<OrderItemStatus, OrderItemStatus[]> = {
        [OrderItemStatus.PENDING]: [OrderItemStatus.ACCEPTED, OrderItemStatus.REJECTED, OrderItemStatus.CANCELLED],
        [OrderItemStatus.ACCEPTED]: [OrderItemStatus.PROCESSING, OrderItemStatus.CANCELLED],
        [OrderItemStatus.REJECTED]: [], // Cannot transition from rejected
        [OrderItemStatus.PROCESSING]: [OrderItemStatus.PICKED, OrderItemStatus.CANCELLED],
        [OrderItemStatus.PICKED]: [OrderItemStatus.PACKED, OrderItemStatus.CANCELLED],
        [OrderItemStatus.PACKED]: [OrderItemStatus.SHIPPED, OrderItemStatus.CANCELLED],
        [OrderItemStatus.SHIPPED]: [OrderItemStatus.DELIVERED],
        [OrderItemStatus.DELIVERED]: [
          OrderItemStatus.RETURN_REQUESTED,
          OrderItemStatus.RETURN_APPROVED,
          OrderItemStatus.RETURN_REJECTED,
        ],
        [OrderItemStatus.CANCELLED]: [], // Cannot transition from cancelled
        [OrderItemStatus.RETURN_REQUESTED]: [OrderItemStatus.RETURN_APPROVED, OrderItemStatus.RETURN_REJECTED],
        [OrderItemStatus.RETURN_APPROVED]: [OrderItemStatus.RETURN_IN_TRANSIT],
        [OrderItemStatus.RETURN_REJECTED]: [], // Cannot transition from rejected
        [OrderItemStatus.RETURN_IN_TRANSIT]: [OrderItemStatus.RETURN_RECEIVED],
        [OrderItemStatus.RETURN_RECEIVED]: [OrderItemStatus.REFUND_PENDING],
        [OrderItemStatus.REFUND_PENDING]: [OrderItemStatus.REFUNDED],
        [OrderItemStatus.REFUNDED]: [], // Final state
      };

      // Admin can bypass transition validation, but vendors must follow transitions
      if (userRole !== "admin" && currentStatus && allowedTransitions[currentStatus]) {
        if (!allowedTransitions[currentStatus].includes(newStatus)) {
          throw new HttpException(
            400,
            `Invalid status transition from ${currentStatus} to ${newStatus}`
          );
        }
      }

      // Prepare update payload
      const updatePayload: any = {
        status: newStatus,
      };

      // If rejecting, store rejection metadata
      if (newStatus === OrderItemStatus.REJECTED) {
        updatePayload.rejectionReason = rejectionReason || "Item rejected by vendor";
        updatePayload.rejectedBy = userId;
        updatePayload.rejectedAt = new Date();
      }

      // Update the order item status
      const updatedItem = await this.orderRepository.updateOrderItem(orderItemId, updatePayload);

      // If item was rejected, recalculate order total and handle refund
      if (newStatus === OrderItemStatus.REJECTED && orderItem.orderId) {
        // Get the order with all items
        const order = await this.orderRepository.getOrderWithItems(orderItem.orderId);
        
        if (order) {
          // Recalculate total amount (exclude rejected items)
          const activeItems = order.items?.filter(
            (item) => item.status !== OrderItemStatus.REJECTED && item.status !== OrderItemStatus.CANCELLED
          ) || [];
          
          const newTotalAmount = activeItems.reduce((sum, item) => {
            return sum + parseFloat(item.totalPrice.toString());
          }, 0);

          // Update order total amount
          await this.orderRepository.update({
            id: orderItem.orderId,
            totalAmount: newTotalAmount,
          } as any);

          // Handle refund if payment was made
          if (order.paymentStatus === PaymentStatus.PAID) {
            // Check if all items are rejected/cancelled
            const allItemsRejectedOrCancelled = order.items?.every(
              (item) => item.status === OrderItemStatus.REJECTED || item.status === OrderItemStatus.CANCELLED
            ) || false;

            if (allItemsRejectedOrCancelled) {
              // All items rejected - full refund
              await this.orderRepository.update({
                id: orderItem.orderId,
                paymentStatus: PaymentStatus.REFUNDED,
              } as any);
              
              // TODO: Integrate with payment gateway to process actual refund
              // Example: await this.paymentService.processRefund(order.id, order.totalAmount);
            } else {
              // Partial refund - only for rejected item
              const rejectedItemAmount = parseFloat(orderItem.totalPrice.toString());
              
              // TODO: Integrate with payment gateway to process partial refund
              // Example: await this.paymentService.processPartialRefund(order.id, rejectedItemAmount);
              
              // Note: Payment status remains "paid" for partial refunds
              // You may want to track partial refunds separately
            }
          }
        }
      }

      // Recalculate order status based on all items
      if (orderItem.orderId) {
        const calculatedStatus = await this.calculateOrderStatus(orderItem.orderId);
        await this.orderRepository.update({
          id: orderItem.orderId,
          status: calculatedStatus,
        } as any);
      }

      return updatedItem;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }
}
