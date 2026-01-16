import crypto from "crypto";
import Container, { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { OrderRepository } from "@/repositories/order/order.repository";
import { CartRepository } from "@/repositories/cart/cart.repository";
import { PromotionRepository } from "@/repositories/promotion/promotion.repository";
import { DealRepository } from "@/repositories/deal/deal.repository";
import {
  PayFastConfig,
  PaymentRequest,
  PaymentResponse,
  PaymentStatus,
  PaymentStatusResponse
} from "@/types/payfast.types";
import { PAYFAST_SERVICE_TOKEN } from "@/interfaces/payfast/IPayfastService.interface";
import { PFNotificationRepository } from "@/repositories/payfast/notification.repository";
import { IPFNotificationCreate } from "@/models/payfast/payfast.model";
import { IOrder, IOrderItem } from "@/types/order.types";
import { CouponRepository } from "@/repositories/coupon/coupon.repository";
import { LOYALTY_SERVICE_TOKEN } from "@/interfaces/loyalty/ILoyaltyService.interface";
import Size from "@/models/size/size.model";
import Product from "@/models/product/product.model";
import Deal from "@/models/deal/deal.model";
import Promotion from "@/models/promotion/promotion.model";

interface PaymentContext {
  userId: number;
  deliveryAddress: string;
  deliveryMethod: string;
  email: string;
  phone: string;
  fullName: string;
  timestamp: number;
}

@Service({ id: PAYFAST_SERVICE_TOKEN })
export class PayFastService {
  private paymentContexts: Map<string, PaymentContext> = new Map();

  constructor(
    private userLoyaltyService = Container.get(LOYALTY_SERVICE_TOKEN),
    private orderRepository: OrderRepository,
    private promotionRepository: PromotionRepository,
    private dealRepository: DealRepository,
    private pfNotificationRepository: PFNotificationRepository,
    private cartRepository: CartRepository,
    private couponRepository: CouponRepository,
  ) {
    setInterval(() => this.cleanupOldContexts(), 60 * 60 * 1000);
  }
public async generatePaymentFromCart(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    console.log(`🚀 Generating payment for user ${request.userId}`);

    const config = this.getPayFastConfig();
    this.validateConfig(config);

    const cartResponse = await this.cartRepository.getFullCartByUserId(request.userId);
    if (!cartResponse || !cartResponse.cartItems || cartResponse.cartItems.length === 0) {
      throw new HttpException(404, "Cart not found or empty");
    }

    console.log(`📦 Cart found with ${cartResponse.cartItems.length} items, total: R${cartResponse.totalAmount}`);

    // ⭐⭐ NEW: Check cart availability before proceeding
    const availabilityCheck = await this.checkCartAvailability(cartResponse);
    
    if (!availabilityCheck.allowCheckout) {
      console.log(`❌ Checkout not allowed for user ${request.userId}:`, availabilityCheck.reasons);
      
      return {
        paymentUrl: '',
        paymentReference: '',
        amount: 0,
        merchantId: config.merchantId,
        allowCheckout: false,
        availabilityIssues: availabilityCheck.reasons
      };
    }

    console.log(`✅ Cart availability check passed - all items are available`);

    // Use R5 for testing in sandbox, actual amount in production
    const finalTotal = config.isProduction ? Number(cartResponse.totalAmount) : 5;

    if (isNaN(finalTotal) || finalTotal <= 0) {
      throw new HttpException(400, "Invalid cart amount");
    }

    const paymentReference = this.generatePaymentReference(request.userId);

    this.storePaymentContext(paymentReference, {
      userId: request.userId,
      deliveryAddress: request.deliveryAddress,
      deliveryMethod: "home-delivery",
      email: request.email,
      phone: request.phone,
      fullName: request.fullName,
      timestamp: Date.now()
    });

    const paymentUrl = this.buildPayFastUrl(config, {
      amount: finalTotal,
      paymentReference,
      itemCount: cartResponse.cartItems.length,
      email: request.email
    });

    console.log(`✅ Payment URL generated successfully: ${paymentReference}`);

    return {
      paymentUrl,
      paymentReference,
      amount: finalTotal,
      merchantId: config.merchantId,
      allowCheckout: true, // ⭐⭐ NEW: Return true when checkout is allowed
      availabilityIssues: [] // ⭐⭐ NEW: Empty array when no issues
    };

  } catch (error) {
    console.error(`❌ Error generating payment:`, error);
    throw error;
  }
}

// ⭐⭐ NEW: Check cart item availability
private async checkCartAvailability(cartResponse: any): Promise<{
  allowCheckout: boolean;
  reasons: string[];
}> {
  try {
    console.log(`🔍 Checking cart availability for ${cartResponse.cartItems.length} items`);
    
    const issues: string[] = [];
    let allItemsAvailable = true;

    for (const item of cartResponse.cartItems) {
      try {
        const itemAvailability = await this.checkCartItemAvailability(item);
        
        if (!itemAvailability.isAvailable) {
          allItemsAvailable = false;
          issues.push(...itemAvailability.reasons);
          console.log(`❌ Cart item not available:`, itemAvailability.reasons);
        }
      } catch (itemError) {
        console.error(`❌ Error checking availability for cart item:`, itemError);
        allItemsAvailable = false;
        issues.push(`Error checking item availability`);
      }
    }

    return {
      allowCheckout: allItemsAvailable,
      reasons: issues
    };
  } catch (error) {
    console.error(`❌ Error in cart availability check:`, error);
    return {
      allowCheckout: false,
      reasons: ['System error checking availability']
    };
  }
}

// ⭐⭐ NEW: Check individual cart item availability
private async checkCartItemAvailability(cartItem: any): Promise<{
  isAvailable: boolean;
  reasons: string[];
}> {
  const reasons: string[] = [];

  try {
    // Check product items
    if (cartItem.product && cartItem.product.productId && cartItem.product.sizeId) {
      const productAvailable = await this.checkProductAvailability(
        cartItem.product.productId,
        cartItem.product.sizeId,
        cartItem.product.quantity
      );
      
      if (!productAvailable.isAvailable) {
        reasons.push(...productAvailable.reasons);
      }
    }

    // Check deal items
    if (cartItem.deal && cartItem.deal.dealId) {
      const dealAvailable = await this.checkDealAvailability(
        cartItem.deal.dealId,
        cartItem.deal.quantity
      );
      
      if (!dealAvailable.isAvailable) {
        reasons.push(...dealAvailable.reasons);
      }
    }

    // Check promotion items
    if (cartItem.promotion && cartItem.promotion.promotionId) {
      const promotionAvailable = await this.checkPromotionAvailability(
        cartItem.promotion.promotionId,
        cartItem.promotion.quantity
      );
      
      if (!promotionAvailable.isAvailable) {
        reasons.push(...promotionAvailable.reasons);
      }
    }

    return {
      isAvailable: reasons.length === 0,
      reasons
    };

  } catch (error) {
    console.error(`❌ Error checking cart item availability:`, error);
    return {
      isAvailable: false,
      reasons: ['Error checking item availability']
    };
  }
}

// ⭐⭐ NEW: Check product availability
private async checkProductAvailability(productId: number, sizeId: number, quantity: number): Promise<{
  isAvailable: boolean;
  reasons: string[];
}> {
  const reasons: string[] = [];

  try {
    // Check if product exists and is active
    const product = await Product.findByPk(productId);
    if (!product) {
      reasons.push(`Product not found`);
      return { isAvailable: false, reasons };
    }


    // Check if size exists and has sufficient stock
    const size = await Size.findByPk(sizeId);
    if (!size) {
      reasons.push(`Size not found`);
      return { isAvailable: false, reasons };
    }

    if (!size.isActive) {
      reasons.push(`Size is no longer available`);
    }

    if (size.stockQuantity < quantity) {
      reasons.push(`Insufficient stock: only ${size.stockQuantity} available, but ${quantity} requested`);
    }

    if (size.stockQuantity < 1) {
      reasons.push(`Size is out of stock`);
    }

    return {
      isAvailable: reasons.length === 0,
      reasons
    };

  } catch (error) {
    console.error(`❌ Error checking product availability:`, error);
    return {
      isAvailable: false,
      reasons: ['Error checking product availability']
    };
  }
}

// ⭐⭐ NEW: Check deal availability
private async checkDealAvailability(dealId: number, quantity: number): Promise<{
  isAvailable: boolean;
  reasons: string[];
}> {
  const reasons: string[] = [];

  try {
    const deal = await Deal.findByPk(dealId);
    if (!deal) {
      reasons.push(`Deal not found`);
      return { isAvailable: false, reasons };
    }

    // Check if deal is active
    if (!deal.isActive) {
      reasons.push(`Deal is no longer active`);
    }

    // Check if deal is within valid date range
    const now = new Date();
    if (deal.startDate > now) {
      reasons.push(`Deal has not started yet`);
    }

    if (deal.endDate < now) {
      reasons.push(`Deal has expired`);
    }

    // Check stock for all products in the deal
    if (deal.products && Array.isArray(deal.products)) {
      for (const dealProduct of deal.products) {
        if (dealProduct.sizeId) {
          const totalQuantity = dealProduct.quantity * quantity;
          const productAvailable = await this.checkProductAvailability(
            dealProduct.productId,
            dealProduct.sizeId,
            totalQuantity
          );
          
          if (!productAvailable.isAvailable) {
            reasons.push(...productAvailable.reasons.map(reason => 
              `Deal product (${dealProduct.productId}): ${reason}`
            ));
          }
        }
      }
    }

    return {
      isAvailable: reasons.length === 0,
      reasons
    };

  } catch (error) {
    console.error(`❌ Error checking deal availability:`, error);
    return {
      isAvailable: false,
      reasons: ['Error checking deal availability']
    };
  }
}

// ⭐⭐ NEW: Check promotion availability
private async checkPromotionAvailability(promotionId: number, quantity: number): Promise<{
  isAvailable: boolean;
  reasons: string[];
}> {
  const reasons: string[] = [];

  try {
    const promotion = await Promotion.findByPk(promotionId);
    if (!promotion) {
      reasons.push(`Promotion not found`);
      return { isAvailable: false, reasons };
    }

    // Check if promotion is active
    if (!promotion.isActive) {
      reasons.push(`Promotion is no longer active`);
    }

    // Check if promotion is within valid date range
    const now = new Date();
    if (promotion.startDate > now) {
      reasons.push(`Promotion has not started yet`);
    }

    if (promotion.endDate < now) {
      reasons.push(`Promotion has expired`);
    }

    // Check stock for all products in the promotion
    if (promotion.products && Array.isArray(promotion.products)) {
      for (const promotionProduct of promotion.products) {
        if (promotionProduct.sizeId) {
          const totalQuantity = promotionProduct.quantity * quantity;
          const productAvailable = await this.checkProductAvailability(
            promotionProduct.productId,
            promotionProduct.sizeId,
            totalQuantity
          );
          
          if (!productAvailable.isAvailable) {
            reasons.push(...productAvailable.reasons.map(reason => 
              `Promotion product (${promotionProduct.productId}): ${reason}`
            ));
          }
        }
      }
    }

    return {
      isAvailable: reasons.length === 0,
      reasons
    };

  } catch (error) {
    console.error(`❌ Error checking promotion availability:`, error);
    return {
      isAvailable: false,
      reasons: ['Error checking promotion availability']
    };
  }
}

  private storePaymentContext(paymentReference: string, context: PaymentContext): void {
    console.log(`💾 Storing payment context for: ${paymentReference}`);
    this.paymentContexts.set(paymentReference, context);
  }

  private cleanupOldContexts(): void {
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    let cleaned = 0;

    for (const [paymentReference, context] of this.paymentContexts.entries()) {
      if (context.timestamp < twentyFourHoursAgo) {
        this.paymentContexts.delete(paymentReference);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} old payment contexts`);
    }
  }

  public async handlePayFastITN(itnData: any): Promise<{
    success: boolean;
    order?: IOrder;
    message: string;
  }> {
    try {
      console.log(`🔔 Processing PayFast ITN:`, {
        m_payment_id: itnData.m_payment_id,
        pf_payment_id: itnData.pf_payment_id,
        payment_status: itnData.payment_status,
        amount_gross: itnData.amount_gross
      });

      const {
        m_payment_id,
        pf_payment_id,
        payment_status,
        amount_gross,
        amount_fee,
        amount_net,
        merchant_id,
        signature,
        email_address,
        item_name,
        billing_date
      } = itnData;

      if (!m_payment_id || !pf_payment_id || !payment_status || !merchant_id) {
        console.log('❌ Missing required ITN fields');
        return { success: false, message: "Missing required ITN fields" };
      }

      if (pf_payment_id && signature) {
        const isDuplicate = await this.isDuplicateNotification(parseInt(pf_payment_id), signature);
        if (isDuplicate) {
          console.log(`⚠️ Duplicate notification detected for PF Payment ID: ${pf_payment_id}`);

          const existingOrder = await this.orderRepository.findOrderByNumber(m_payment_id);
          if (existingOrder) {
            return {
              success: true,
              order: existingOrder,
              message: "Duplicate notification - order already exists"
            };
          }

          return { success: true, message: "Duplicate notification - already processed" };
        }
      }

      let notificationSaved = false;
      try {
        console.log(`💾 Saving PayFast notification...`);

        const notificationData: IPFNotificationCreate = {
          merchantId: parseInt(merchant_id),
          pfPaymentId: parseInt(pf_payment_id),
          paymentStatus: payment_status.toUpperCase(),
          paymentReference: m_payment_id,
          itemName: item_name && typeof item_name === 'string' && item_name.trim() !== '' ? item_name.trim() : null,
          amountGross: amount_gross ? parseFloat(amount_gross) : null,
          amountFee: amount_fee ? parseFloat(amount_fee) : null,
          amountNet: amount_net ? parseFloat(amount_net) : null,
          emailAddress: this.cleanEmail(email_address),
          billingDate: this.parseDate(billing_date),
          signature: signature || null,
          rawItnData: JSON.stringify(itnData)
        };

        await this.pfNotificationRepository.createNotification(notificationData);
        notificationSaved = true;
        console.log(`✅ PayFast notification saved successfully`);

      } catch (dbError) {
        console.error(`❌ Failed to save notification to database:`, dbError);
      }

      const existingOrder = await this.orderRepository.findOrderByNumber(m_payment_id);
      if (existingOrder) {
        console.log(`✅ Order already exists for payment reference: ${m_payment_id}`);
        return {
          success: true,
          order: existingOrder,
          message: "Order already exists"
        };
      }

      const paymentStatus = this.parsePaymentStatus(payment_status);
      console.log(`📊 Payment status: ${payment_status} → ${paymentStatus}`);

      if (paymentStatus === PaymentStatus.PAID && notificationSaved) {
        console.log(`✅ Payment confirmed via ITN - attempting auto order creation for: ${m_payment_id}`);

        try {
          const createdOrder = await this.autoCreateOrderFromPayment(m_payment_id);
          if (createdOrder) {
            console.log(`🎉 Order automatically created: Order ${createdOrder.orderNumber}`);
            return {
              success: true,
              order: createdOrder,
              message: "Payment confirmed and order created automatically"
            };
          } else {
            console.log(`⚠️ Auto order creation failed - payment context not found or expired`);
            return {
              success: true,
              message: "Payment confirmed via ITN - order creation requires manual verification"
            };
          }
        } catch (orderError) {
          console.error(`❌ Auto order creation failed:`, orderError);
          return {
            success: true,
            message: "Payment confirmed but auto order creation failed - manual verification required"
          };
        }
      } else {
        console.log(`ℹ️ Payment not completed or notification save failed, status: ${payment_status}`);
        return {
          success: true,
          message: `Payment status: ${payment_status}`
        };
      }

    } catch (error) {
      console.error("❌ ITN handling error:", error);
      return {
        success: false,
        message: `ITN processing failed: ${error.message}`
      };
    }
  }
// In your PayFastService, update the autoCreateOrderFromPayment method:

private async autoCreateOrderFromPayment(paymentReference: string): Promise<IOrder | null> {
  try {
    console.log(`🤖 Attempting auto order creation for payment: ${paymentReference}`);

    const context = this.getPaymentContext(paymentReference);
    if (!context) {
      console.log(`❌ No payment context found for: ${paymentReference}`);
      return null;
    }

    console.log(`📋 Found payment context:`, {
      userId: context.userId,
      deliveryMethod: context.deliveryMethod
    });

    const existingOrder = await this.orderRepository.findOrderByNumber(paymentReference);
    if (existingOrder) {
      console.log(`✅ Order already exists for payment ${paymentReference}: Order ${existingOrder.orderNumber}`);
      this.paymentContexts.delete(paymentReference);
      return existingOrder;
    }

    // Get cart using userId
    const cartResponse = await this.cartRepository.getFullCartByUserId(context.userId);
    if (!cartResponse || !cartResponse.cartItems || cartResponse.cartItems.length === 0) {
      console.log(`❌ Cart validation failed for user ${context.userId}`);
      return null;
    }

    console.log(`✅ Cart validation passed:`, {
      userId: context.userId,
      itemCount: cartResponse.cartItems.length,
      subtotal: cartResponse.subtotal,
      discountApplied: cartResponse.discountApplied,
      totalAmount: cartResponse.totalAmount
    });

    // Create order with totals from cart response
    const orderData: IOrder = {
      userId: context.userId,
      orderNumber: paymentReference,
      totalAmount: cartResponse.totalAmount,
      couponId: cartResponse.coupon?.id || null,
      subtotal: cartResponse.subtotal,
      taxAmount: 0,
      discountAmount: cartResponse.discountApplied,
      shippingFee: 0,
      status: "confirmed",
      paymentMethod: "bank-transfer",
      paymentStatus: "paid",
      deliveryMethod: context.deliveryMethod,
      deliveryAddress: context.deliveryAddress,
    };

    const order = await this.orderRepository.createOrder(orderData);
    
    // Apply coupon usage if applicable
    if (cartResponse.coupon?.id) {
      await this.couponRepository.incrementUsageCount(cartResponse.coupon?.id);
    }

    // Convert cart items to order items
    const orderItems: IOrderItem[] = cartResponse.cartItems.map((cartItem: any) => ({
      deal: cartItem.deal || undefined,
      promotion: cartItem.promotion || undefined,
      product: cartItem.product || undefined
    }));

    await this.orderRepository.createOrderItems(order.id!, orderItems);

    // ⭐⭐ UPDATED: Decrement stock for ALL item types (products, deals, promotions)
    await this.decrementAllStockQuantities(orderItems);

    console.log(`✅ Auto order created successfully:`, {
      orderNumber: order.orderNumber,
      paymentReference,
      subtotal: order.subtotal,
      discount: order.discountAmount,
      total: order.totalAmount,
      paymentStatus: order.paymentStatus,
      itemsCount: orderItems.length
    });

    // Add loyalty points for this order
    const pointsResult = await this.userLoyaltyService.addPointsForOrder(
      context.userId,
      order.id!,
      order.totalAmount
    );

    console.log(`🎉 Loyalty points awarded: ${pointsResult.basePoints} base + ${pointsResult.bonusPoints} bonus`);

    // Clear cart after successful order creation using userId
    try {
      await this.cartRepository.clearUserCart(context.userId);
      console.log(`🗑️ Cart cleared successfully after order creation`);
    } catch (cartError) {
      console.error(`⚠️ Failed to clear cart:`, cartError);
    }

    this.paymentContexts.delete(paymentReference);
    console.log(`🧹 Payment context cleaned up for: ${paymentReference}`);

    return order;

  } catch (error) {
    console.error(`❌ Error in auto order creation for ${paymentReference}:`, error);
    return null;
  }
}

// ⭐⭐ UPDATED: Decrement stock for ALL item types with deactivation logic
private async decrementAllStockQuantities(orderItems: IOrderItem[]): Promise<void> {
  try {
    console.log(`📦 Starting stock decrementation for ${orderItems.length} order items of all types`);

    let totalStockUpdates = 0;
    const dealsToCheck = new Set<number>();
    const promotionsToCheck = new Set<number>();

    for (const item of orderItems) {
      try {
        let stockUpdates = 0;

        // Handle regular products
        if (item.product && item.product.sizeId) {
          const sizeStockAfterUpdate = await this.decrementSizeStock(
            item.product.sizeId,
            item.product.quantity
          );
          stockUpdates++;
          
          // Check if stock is now less than 1 and collect related deals/promotions
          if (sizeStockAfterUpdate < 1) {
            const relatedDealsPromotions = await this.findDealsPromotionsBySizeId(item.product.sizeId);
            relatedDealsPromotions.deals.forEach(dealId => dealsToCheck.add(dealId));
            relatedDealsPromotions.promotions.forEach(promotionId => promotionsToCheck.add(promotionId));
          }
          
          console.log(`📦 Decremented stock for product: size ${item.product.sizeId}, quantity ${item.product.quantity}`);
        }

        // Handle deals - extract products from deal and decrement their stock
        if (item.deal && item.deal.dealId) {
          const dealStockUpdates = await this.decrementDealStock(item.deal.dealId, item.deal.quantity);
          stockUpdates += dealStockUpdates;
          dealsToCheck.add(item.deal.dealId); // Add deal to check list
        }

        // Handle promotions - extract products from promotion and decrement their stock
        if (item.promotion && item.promotion.promotionId) {
          const promotionStockUpdates = await this.decrementPromotionStock(item.promotion.promotionId, item.promotion.quantity);
          stockUpdates += promotionStockUpdates;
          promotionsToCheck.add(item.promotion.promotionId); // Add promotion to check list
        }

        totalStockUpdates += stockUpdates;
        console.log(`✅ Processed ${stockUpdates} stock updates for order item`);

      } catch (itemError) {
        console.error(`❌ Error processing stock for order item:`, itemError);
        // Continue with other items even if one fails
      }
    }

    // ⭐⭐ NEW: Check and deactivate deals/promotions with insufficient stock
    await this.checkAndDeactivateDeals(Array.from(dealsToCheck));
    await this.checkAndDeactivatePromotions(Array.from(promotionsToCheck));

    console.log(`✅ Stock decrementation completed: ${totalStockUpdates} total stock updates across ${orderItems.length} order items`);
  } catch (error) {
    console.error(`❌ Error in stock decrementation:`, error);
    throw error;
  }
}

// ⭐⭐ UPDATED: Decrement stock for a specific size - now returns the new stock quantity
private async decrementSizeStock(sizeId: number, quantity: number): Promise<number> {
  try {
    console.log(`🔽 Decrementing stock for size ${sizeId}, quantity: ${quantity}`);

    const size = await Size.findOne({
      where: { id: sizeId }
    });

    if (!size) {
      console.error(`❌ Size not found: ${sizeId}`);
      throw new Error(`Size ${sizeId} not found`);
    }

    const currentStock = size.stockQuantity;
    
    // Check if sufficient stock exists
    if (currentStock < quantity) {
      console.error(`❌ Insufficient stock for size ${sizeId}: ${currentStock} available, ${quantity} requested`);
      throw new Error(`Insufficient stock for size ${sizeId}`);
    }

    const newStock = currentStock - quantity;

    await size.update({
      stockQuantity: newStock
    });

    console.log(`✅ Stock updated for size ${sizeId}: ${currentStock} → ${newStock}`);

    // Update product status if out of stock
    if (newStock === 0) {
      await Product.update(
        { status: 'out-of-stock' },
        { where: { id: size.productId } }
      );
      console.log(`📦 Product ${size.productId} marked as out-of-stock`);
    }

    return newStock; // ⭐⭐ Return the new stock quantity

  } catch (error) {
    console.error(`❌ Error decrementing stock for size ${sizeId}:`, error);
    throw error;
  }
}

// ⭐⭐ NEW: Find deals and promotions that contain a specific size ID
private async findDealsPromotionsBySizeId(sizeId: number): Promise<{ deals: number[], promotions: number[] }> {
  try {
    console.log(`🔍 Finding deals and promotions containing size ${sizeId}`);
    
    const deals: number[] = [];
    const promotions: number[] = [];

    // Find deals containing this size
    const allDeals = await Deal.findAll({
      where: { isActive: true },
      attributes: ['id', 'products']
    });

    for (const deal of allDeals) {
      if (deal.products && Array.isArray(deal.products)) {
        const hasSize = deal.products.some((product: any) => product.sizeId === sizeId);
        if (hasSize) {
          deals.push(deal.id);
        }
      }
    }

    // Find promotions containing this size
    const allPromotions = await Promotion.findAll({
      where: { isActive: true },
      attributes: ['id', 'products']
    });

    for (const promotion of allPromotions) {
      if (promotion.products && Array.isArray(promotion.products)) {
        const hasSize = promotion.products.some((product: any) => product.sizeId === sizeId);
        if (hasSize) {
          promotions.push(promotion.id);
        }
      }
    }

    console.log(`✅ Found ${deals.length} deals and ${promotions.length} promotions containing size ${sizeId}`);
    
    return { deals, promotions };
  } catch (error) {
    console.error(`❌ Error finding deals/promotions for size ${sizeId}:`, error);
    return { deals: [], promotions: [] };
  }
}

// ⭐⭐ NEW: Check and deactivate deals with insufficient stock
private async checkAndDeactivateDeals(dealIds: number[]): Promise<void> {
  try {
    if (dealIds.length === 0) return;

    console.log(`🔍 Checking ${dealIds.length} deals for insufficient stock`);
    
    for (const dealId of dealIds) {
      try {
        const shouldDeactivate = await this.shouldDeactivateDeal(dealId);
        
        if (shouldDeactivate) {
          console.log(`🚫 Deactivating deal ${dealId} due to insufficient stock`);
          await this.dealRepository.deactivateDeal(dealId);
          console.log(`✅ Deal ${dealId} deactivated successfully`);
        } else {
          console.log(`✅ Deal ${dealId} has sufficient stock, no action needed`);
        }
      } catch (dealError) {
        console.error(`❌ Error processing deal ${dealId}:`, dealError);
      }
    }
  } catch (error) {
    console.error(`❌ Error in deal deactivation check:`, error);
  }
}

// ⭐⭐ NEW: Check and deactivate promotions with insufficient stock
private async checkAndDeactivatePromotions(promotionIds: number[]): Promise<void> {
  try {
    if (promotionIds.length === 0) return;

    console.log(`🔍 Checking ${promotionIds.length} promotions for insufficient stock`);
    

    for (const promotionId of promotionIds) {
      try {
        const shouldDeactivate = await this.shouldDeactivatePromotion(promotionId);
        
        if (shouldDeactivate) {
          console.log(`🚫 Deactivating promotion ${promotionId} due to insufficient stock`);
          await this.promotionRepository.deActivate(promotionId);
          console.log(`✅ Promotion ${promotionId} deactivated successfully`);
        } else {
          console.log(`✅ Promotion ${promotionId} has sufficient stock, no action needed`);
        }
      } catch (promotionError) {
        console.error(`❌ Error processing promotion ${promotionId}:`, promotionError);
      }
    }
  } catch (error) {
    console.error(`❌ Error in promotion deactivation check:`, error);
  }
}

// ⭐⭐ NEW: Check if a deal should be deactivated (any size has stock < 1)
private async shouldDeactivateDeal(dealId: number): Promise<boolean> {
  try {
    const deal = await Deal.findByPk(dealId);
    if (!deal || !deal.products || !Array.isArray(deal.products)) {
      return false;
    }

    for (const dealProduct of deal.products) {
      if (dealProduct.sizeId) {
        const size = await Size.findOne({
          where: { id: dealProduct.sizeId },
          attributes: ['stockQuantity']
        });

        if (size && size.stockQuantity < 1) {
          console.log(`❌ Deal ${dealId} has size ${dealProduct.sizeId} with stock ${size.stockQuantity} - should deactivate`);
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error(`❌ Error checking deal ${dealId} stock:`, error);
    return false;
  }
}

// ⭐⭐ NEW: Check if a promotion should be deactivated (any size has stock < 1)
private async shouldDeactivatePromotion(promotionId: number): Promise<boolean> {
  try {
    const promotion = await Promotion.findByPk(promotionId);
    if (!promotion || !promotion.products || !Array.isArray(promotion.products)) {
      return false;
    }

    for (const promotionProduct of promotion.products) {
      if (promotionProduct.sizeId) {
        const size = await Size.findOne({
          where: { id: promotionProduct.sizeId },
          attributes: ['stockQuantity']
        });

        if (size && size.stockQuantity < 1) {
          console.log(`❌ Promotion ${promotionId} has size ${promotionProduct.sizeId} with stock ${size.stockQuantity} - should deactivate`);
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error(`❌ Error checking promotion ${promotionId} stock:`, error);
    return false;
  }
}

// ⭐⭐ UPDATED: Decrement stock for deal products
private async decrementDealStock(dealId: number, dealQuantity: number): Promise<number> {
  try {
    console.log(`🔽 Processing stock for deal ${dealId}, quantity: ${dealQuantity}`);

    const deal = await Deal.findByPk(dealId);
    if (!deal || !deal.products || !Array.isArray(deal.products)) {
      console.error(`❌ Deal not found or has no products: ${dealId}`);
      return 0;
    }

    let stockUpdates = 0;

    for (const dealProduct of deal.products) {
      if (dealProduct.sizeId) {
        const totalQuantity = dealProduct.quantity * dealQuantity;
        await this.decrementSizeStock(dealProduct.sizeId, totalQuantity);
        stockUpdates++;
        console.log(`📦 Decremented stock for deal product: size ${dealProduct.sizeId}, quantity ${totalQuantity}`);
      }
    }

    console.log(`✅ Processed ${stockUpdates} stock updates for deal ${dealId}`);
    return stockUpdates;

  } catch (error) {
    console.error(`❌ Error decrementing deal stock:`, error);
    throw error;
  }
}

// ⭐⭐ UPDATED: Decrement stock for promotion products
private async decrementPromotionStock(promotionId: number, promotionQuantity: number): Promise<number> {
  try {
    console.log(`🔽 Processing stock for promotion ${promotionId}, quantity: ${promotionQuantity}`);

    const promotion = await Promotion.findByPk(promotionId);
    if (!promotion || !promotion.products || !Array.isArray(promotion.products)) {
      console.error(`❌ Promotion not found or has no products: ${promotionId}`);
      return 0;
    }

    let stockUpdates = 0;

    for (const promotionProduct of promotion.products) {
      if (promotionProduct.sizeId) {
        const totalQuantity = promotionProduct.quantity * promotionQuantity;
        await this.decrementSizeStock(promotionProduct.sizeId, totalQuantity);
        stockUpdates++;
        console.log(`📦 Decremented stock for promotion product: size ${promotionProduct.sizeId}, quantity ${totalQuantity}`);
      }
    }

    console.log(`✅ Processed ${stockUpdates} stock updates for promotion ${promotionId}`);
    return stockUpdates;

  } catch (error) {
    console.error(`❌ Error decrementing promotion stock:`, error);
    throw error;
  }
}

  private getPaymentContext(paymentReference: string): PaymentContext | null {
    const context = this.paymentContexts.get(paymentReference);

    if (!context) {
      console.log(`❌ Payment context not found for: ${paymentReference}`);
      return null;
    }

    const isExpired = Date.now() - context.timestamp > 24 * 60 * 60 * 1000;
    if (isExpired) {
      console.log(`⏰ Payment context expired for: ${paymentReference}`);
      this.paymentContexts.delete(paymentReference);
      return null;
    }

    return context;
  }

  public async checkPaymentStatus(paymentReference: string): Promise<PaymentStatusResponse> {
    try {
      console.log(`🔍 Checking payment status for: ${paymentReference}`);

      const existingOrder = await this.orderRepository.findOrderByNumber(paymentReference);
      if (existingOrder) {
        console.log(`✅ Order already exists for payment: ${paymentReference}`);
        return {
          status: PaymentStatus.PAID,
          orderExists: true,
          order: existingOrder,
          verified: true
        };
      }

      const notificationRecord = await this.findNotificationByPaymentReference(paymentReference);
      if (notificationRecord && notificationRecord.paymentStatus === 'COMPLETE') {
        console.log(`✅ Payment verified from notification record: ${paymentReference}`);
        return {
          status: PaymentStatus.PAID,
          orderExists: false,
          verified: true
        };
      }

      console.log(`ℹ️ No notification found for payment: ${paymentReference}`);
      return {
        status: PaymentStatus.PENDING,
        orderExists: false,
        verified: false
      };

    } catch (error) {
      console.error(`❌ Error checking payment status for ${paymentReference}:`, error);
      return {
        status: PaymentStatus.FAILED,
        orderExists: false,
        verified: false
      };
    }
  }

  private async findNotificationByPaymentReference(paymentReference: string): Promise<any> {
    try {
      console.log(`🔍 Looking for notification with payment reference: ${paymentReference}`);
      return await this.pfNotificationRepository.findByPaymentReference(paymentReference);
    } catch (error) {
      console.error("Error finding notification by payment reference:", error);
      return null;
    }
  }

  private async isDuplicateNotification(pfPaymentId: number, signature: string): Promise<boolean> {
    try {
      return await this.pfNotificationRepository.notificationExists(pfPaymentId, signature);
    } catch (error) {
      console.error("Error checking duplicate notification:", error);
      return false;
    }
  }

  private buildPayFastUrl(config: PayFastConfig, params: {
    amount: number;
    paymentReference: string;
    cartId?: number;
    deliveryOption?: "home-delivery" | "store-pickup";
    itemCount?: number;
    email: string;
  }): string {

    const returnUrl = `${process.env.PAYFAST_RETURN_URL}/client/dashboard/order-history?paymentReference=${params.paymentReference}&status=success`;
    const cancelUrl = `${process.env.PAYFAST_CANCEL_URL || process.env.PAYFAST_RETURN_URL}/client/checkout?paymentReference=${params.paymentReference}&status=cancelled`;

    const itemName = `Cart Order #${params.cartId}`;
    const itemDescription = `Cart ${params.cartId} - ${params.deliveryOption} - ${params.itemCount} items`;

    const paymentParams: Record<string, string> = {
      merchant_id: config.merchantId,
      merchant_key: config.merchantKey,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: `${process.env.BACKEND_URL}/api/payfast/notification`,
      m_payment_id: params.paymentReference,
      amount: params.amount.toFixed(2),
      item_name: itemName,
      item_description: itemDescription,
      email_address: params.email || 'customer@example.com',
    };

    const signature = this.generateSignature(paymentParams);

    const finalParams: Record<string, string> = {
      ...paymentParams,
      signature: signature
    };

    const queryString = Object.entries(finalParams)
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    const finalUrl = `${config.paymentUrl}/eng/process?${queryString}`;

    console.log('🔗 Final PayFast URL generated');
    return finalUrl;
  }
  private generateSignature(params: Record<string, any>): string {
    try {
      const signatureParams = { ...params };
      delete signatureParams.signature;

      const sortedKeys = Object.keys(signatureParams).sort();
      const parameterString = sortedKeys
        .filter(key => {
          const value = signatureParams[key];
          return value !== null && value !== undefined && value !== '';
        })
        .map(key => `${key}=${signatureParams[key]}`)
        .join('&');

      const signature = crypto.createHash('md5').update(parameterString).digest('hex');
      console.log('🔐 Generated signature');

      return signature;
    } catch (error) {
      console.error('❌ Error generating signature:', error);
      throw new HttpException(500, 'Failed to generate payment signature');
    }
  }


  private getPayFastConfig(): PayFastConfig {
    const isProduction = process.env.PAYFAST_ENV === "true" ? true : false;

    console.log(`🌍 PayFast Environment: ${isProduction ? 'PRODUCTION' : 'SANDBOX'}`);

    if (isProduction) {
      if (!process.env.PAYFAST_MERCHANT_ID || !process.env.PAYFAST_MERCHANT_KEY) {
        throw new HttpException(500, "Missing production PayFast credentials");
      }

      return {
        merchantId: process.env.PAYFAST_MERCHANT_ID,
        merchantKey: process.env.PAYFAST_MERCHANT_KEY,
        paymentUrl: 'https://www.payfast.co.za',
        isProduction: isProduction
      };
    } else {
      return {
        merchantId: process.env.PAYFAST_MERCHANT_ID_SANDBOX || '10000100',
        merchantKey: process.env.PAYFAST_MERCHANT_KEY_SANDBOX || '46f0cd694581a',
        paymentUrl: 'https://sandbox.payfast.co.za',
        isProduction: false
      };
    }
  }


  private generatePaymentReference(userId: number, prefix: string = 'Order'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}_${timestamp}_${userId}_${random}`;
  }

  private parsePaymentStatus(paymentStatus: string): PaymentStatus {
    const status = paymentStatus?.toUpperCase().trim();
    switch (status) {
      case "COMPLETED":
      case "COMPLETE":
      case "PAID":
      case "SUCCESS":
        return PaymentStatus.PAID;
      case "FAILED":
      case "FAILURE":
      case "ERROR":
        return PaymentStatus.FAILED;
      case "CANCELLED":
      case "CANCELED":
      case "CANCEL":
        return PaymentStatus.CANCELLED;
      case "DECLINED":
      case "DECLINE":
        return PaymentStatus.DECLINED;
      case "PROCESSING":
      case "PENDING":
        return PaymentStatus.PROCESSING;
      default:
        return PaymentStatus.PENDING;
    }
  }

  private validateConfig(config: PayFastConfig): void {
    if (!config.merchantId || !config.merchantKey) {
      throw new HttpException(500, "Missing PayFast configuration - check merchant ID and key");
    }

    if (!process.env.BACKEND_URL) {
      throw new HttpException(500, "Missing BACKEND_URL configuration");
    }

    if (!process.env.PAYFAST_RETURN_URL) {
      throw new HttpException(500, "Missing PAYFAST_RETURN_URL configuration");
    }
  }

  private cleanEmail(email: string | undefined | null): string | null {
    if (!email || typeof email !== 'string') return null;
    const trimmed = email.trim();
    if (trimmed === '') return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed) ? trimmed : null;
  }

  private parseDate(dateString: string | undefined | null): Date | null {
    if (!dateString || typeof dateString !== 'string') return null;
    const trimmed = dateString.trim();
    if (trimmed === '') return null;
    try {
      const date = new Date(trimmed);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  private async clearCart(userId: number): Promise<void> {
    try {
      await this.cartRepository.clearUserCart(userId);
    } catch (error) {
      console.error(`❌ Error clearing cart for user ${userId}:`, error);
      throw error;
    }
  }
}