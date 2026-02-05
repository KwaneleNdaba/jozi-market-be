import { Inject, Service } from "typedi";
import crypto from "crypto";
import { HttpException } from "@/exceptions/HttpException";
import { type IPayfastService, PAYFAST_SERVICE_TOKEN } from "@/interfaces/payfast/IPayfastService.interface";
import { CART_REPOSITORY_TOKEN } from "@/interfaces/cart/ICartRepository.interface";
import type { ICartRepository } from "@/interfaces/cart/ICartRepository.interface";
import { ORDER_REPOSITORY_TOKEN } from "@/interfaces/order/IOrderRepository.interface";
import type { IOrderRepository } from "@/interfaces/order/IOrderRepository.interface";
import { ORDER_SERVICE_TOKEN } from "@/interfaces/order/IOrderService.interface";
import type { IOrderService } from "@/interfaces/order/IOrderService.interface";
import { INVENTORY_SERVICE_TOKEN } from "@/interfaces/inventory/IInventoryService.interface";
import type { IInventoryService } from "@/interfaces/inventory/IInventoryService.interface";
import type { PaymentRequest, PaymentResponse, PaymentStatusResponse, PaymentContext, PayFastConfig } from "@/types/payfast.types";
import { PaymentStatus } from "@/types/payfast.types";
import type { ICreateOrder } from "@/types/order.types";

@Service({ id: PAYFAST_SERVICE_TOKEN })
export class PayFastService implements IPayfastService {
  private paymentContexts: Map<string, PaymentContext> = new Map();

  constructor(
    @Inject(CART_REPOSITORY_TOKEN) private readonly cartRepository: ICartRepository,
    @Inject(ORDER_REPOSITORY_TOKEN) private readonly orderRepository: IOrderRepository,
    @Inject(ORDER_SERVICE_TOKEN) private readonly orderService: IOrderService,
    @Inject(INVENTORY_SERVICE_TOKEN) private readonly inventoryService: IInventoryService
  ) {
    // Cleanup old contexts every hour
    setInterval(() => this.cleanupOldContexts(), 60 * 60 * 1000);
  }

  public async generatePaymentFromCart(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log(`🚀 Generating payment for user ${request.userId}`);

      const config = this.getPayFastConfig();
      this.validateConfig(config);

      // Get user's cart
      const cart = await this.cartRepository.getCartWithItems(request.userId);
      if (!cart || !cart.items || cart.items.length === 0) {
        throw new HttpException(400, "Cart is empty");
      }

      // Calculate total amount from cart items
      // We'll use the order service to calculate the total properly
      // For now, we'll calculate a rough estimate, but the actual total will be calculated when creating the order
      let totalAmount = 0;
      for (const item of cart.items) {
        if (item.product) {
          let itemPrice = 0;
          if (item.productVariantId && item.product.variants) {
            const variant = item.product.variants.find((v: any) => v.id === item.productVariantId);
            if (variant) {
              const price = variant.discountPrice || variant.price || 0;
              itemPrice = typeof price === 'string' ? parseFloat(price) : price;
            }
          } else {
            // Get price from product - check both flat structure and technicalDetails
            const productPrice = (item.product as any).discountPrice || 
                                (item.product as any).regularPrice || 
                                ((item.product as any).technicalDetails?.discountPrice) ||
                                ((item.product as any).technicalDetails?.regularPrice) || 0;
            itemPrice = typeof productPrice === 'string' ? parseFloat(productPrice) : productPrice;
          }
          const quantity = item.quantity || 1;
          totalAmount += itemPrice * quantity;
        }
      }

      // Use R5 for testing in sandbox, actual amount in production
      const finalTotal = config.isProduction ? totalAmount : 5;

      if (isNaN(finalTotal) || finalTotal <= 0) {
        throw new HttpException(400, "Invalid cart amount");
      }

      const paymentReference = this.generatePaymentReference(request.userId);

      // Store payment context for later order creation
      this.storePaymentContext(paymentReference, {
        userId: request.userId,
        shippingAddress: request.deliveryAddress || {},
        paymentMethod: "payfast",
        email: request.email,
        phone: request.phone,
        fullName: request.fullName,
        timestamp: Date.now(),
      });

      const paymentUrl = this.buildPayFastUrl(config, {
        amount: finalTotal,
        paymentReference,
        itemCount: cart.items.length,
        email: request.email,
      });

      console.log(`✅ Payment URL generated successfully: ${paymentReference}`);

      return {
        paymentUrl,
        paymentReference,
        amount: finalTotal,
        merchantId: config.merchantId,
      };
    } catch (error: any) {
      console.error(`❌ Error generating payment:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async handlePayFastITN(itnData: any): Promise<{
    success: boolean;
    order?: any;
    message: string;
  }> {
    try {
      console.log(`🔔 Processing PayFast ITN:`, {
        m_payment_id: itnData.m_payment_id,
        pf_payment_id: itnData.pf_payment_id,
        payment_status: itnData.payment_status,
        amount_gross: itnData.amount_gross,
      });

      const {
        m_payment_id,
        pf_payment_id,
        payment_status,
        amount_gross,
      } = itnData;

      if (!m_payment_id || !pf_payment_id || !payment_status) {
        console.log("❌ Missing required ITN fields");
        return { success: false, message: "Missing required ITN fields" };
      }

      // Check if order already exists
      const existingOrder = await this.orderRepository.findByOrderNumber(m_payment_id);
      if (existingOrder) {
        console.log(`✅ Order already exists for payment reference: ${m_payment_id}`);
        return {
          success: true,
          order: existingOrder,
          message: "Order already exists",
        };
      }

      const paymentStatus = this.parsePaymentStatus(payment_status);
      console.log(`📊 Payment status: ${payment_status} → ${paymentStatus}`);

      if (paymentStatus === PaymentStatus.PAID) {
        console.log(`✅ Payment confirmed via ITN - attempting auto order creation for: ${m_payment_id}`);

        try {
          const createdOrder = await this.autoCreateOrderFromPayment(m_payment_id);
          if (createdOrder) {
            console.log(`🎉 Order automatically created: Order ${createdOrder.orderNumber}`);
            return {
              success: true,
              order: createdOrder,
              message: "Payment confirmed and order created automatically",
            };
          } else {
            console.log(`⚠️ Auto order creation failed - payment context not found or expired`);
            return {
              success: true,
              message: "Payment confirmed via ITN - order creation requires manual verification",
            };
          }
        } catch (orderError: any) {
          console.error(`❌ Auto order creation failed:`, orderError);
          return {
            success: true,
            message: "Payment confirmed but auto order creation failed - manual verification required",
          };
        }
      } else {
        console.log(`ℹ️ Payment not completed, status: ${payment_status}`);
        return {
          success: true,
          message: `Payment status: ${payment_status}`,
        };
      }
    } catch (error: any) {
      console.error("❌ ITN handling error:", error);
      return {
        success: false,
        message: `ITN processing failed: ${error.message}`,
      };
    }
  }

  private async autoCreateOrderFromPayment(paymentReference: string): Promise<any | null> {
    try {
      console.log(`🤖 Attempting auto order creation for payment: ${paymentReference}`);

      const context = this.getPaymentContext(paymentReference);
      if (!context) {
        console.log(`❌ No payment context found for: ${paymentReference}`);
        return null;
      }

      console.log(`📋 Found payment context:`, {
        userId: context.userId,
        paymentMethod: context.paymentMethod,
      });

      const existingOrder = await this.orderRepository.findByOrderNumber(paymentReference);
      if (existingOrder) {
        console.log(`✅ Order already exists for payment ${paymentReference}: Order ${existingOrder.orderNumber}`);
        this.paymentContexts.delete(paymentReference);
        return existingOrder;
      }

      // Create order from cart using the order service
      // The order service will create the order with items and calculate total
      const orderData: ICreateOrder = {
        userId: context.userId,
        shippingAddress: context.shippingAddress,
        paymentMethod: context.paymentMethod,
        email: context.email,
        phone: context.phone,
        notes: `Payment reference: ${paymentReference}`,
      };

      const order = await this.orderService.createOrder(context.userId, orderData);

      // Update order with payment reference as order number and paid status
      await this.orderRepository.update({
        id: order.id!,
        orderNumber: paymentReference,
        paymentStatus: "paid",
      } as any);

      // Deduct stock after payment success (reserved → sold, create OUT movement)
      await this.inventoryService.deductOnPaymentSuccess(order.id!);

      console.log(`✅ Auto order created successfully:`, {
        orderNumber: order.orderNumber,
        paymentReference,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
      });

      // Clean up payment context
      this.paymentContexts.delete(paymentReference);
      console.log(`🧹 Payment context cleaned up for: ${paymentReference}`);

      return order;
    } catch (error: any) {
      console.error(`❌ Error in auto order creation for ${paymentReference}:`, error);
      return null;
    }
  }

  public async checkPaymentStatus(paymentReference: string): Promise<PaymentStatusResponse> {
    try {
      console.log(`🔍 Checking payment status for: ${paymentReference}`);

      const existingOrder = await this.orderRepository.findByOrderNumber(paymentReference);
      if (existingOrder) {
        console.log(`✅ Order already exists for payment: ${paymentReference}`);
        return {
          status: PaymentStatus.PAID,
          orderExists: true,
          order: existingOrder,
          verified: true,
        };
      }

      console.log(`ℹ️ No order found for payment: ${paymentReference}`);
      return {
        status: PaymentStatus.PENDING,
        orderExists: false,
        verified: false,
      };
    } catch (error: any) {
      console.error(`❌ Error checking payment status for ${paymentReference}:`, error);
      return {
        status: PaymentStatus.FAILED,
        orderExists: false,
        verified: false,
      };
    }
  }

  private storePaymentContext(paymentReference: string, context: PaymentContext): void {
    console.log(`💾 Storing payment context for: ${paymentReference}`);
    this.paymentContexts.set(paymentReference, context);
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

  private cleanupOldContexts(): void {
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
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

  private buildPayFastUrl(
    config: PayFastConfig,
    params: {
      amount: number;
      paymentReference: string;
      itemCount?: number;
      email: string;
    }
  ): string {
    const returnUrl = `${process.env.PAYFAST_RETURN_URL}/checkout/success?transactionId=${params.paymentReference}&status=success`;
    const cancelUrl = `${process.env.PAYFAST_CANCEL_URL || process.env.PAYFAST_RETURN_URL}/checkout/cancel?transactionId=${params.paymentReference}&status=cancelled`;

 
    const itemName = `Cart Order #${params.paymentReference}`;
    const itemDescription = `Order with ${params.itemCount || 0} items`;

    const paymentParams: Record<string, string> = {
      merchant_id: config.merchantId,
      merchant_key: config.merchantKey,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: `${process.env.BACKEND_URL || process.env.API_URL}/api/payfast/notification`,
      m_payment_id: params.paymentReference,
      amount: params.amount.toFixed(2),
      item_name: itemName,
      item_description: itemDescription,
      email_address: params.email || 'customer@example.com',
    };

    const signature = this.generateSignature(paymentParams);

    const finalParams: Record<string, string> = {
      ...paymentParams,
      signature: signature,
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
    const isProduction = process.env.PAYFAST_ENV === "true" || process.env.PAYFAST_ENV === "production";

    console.log(`🌍 PayFast Environment: ${isProduction ? "PRODUCTION" : "SANDBOX"}`);

    if (isProduction) {
      if (!process.env.PAYFAST_MERCHANT_ID || !process.env.PAYFAST_MERCHANT_KEY) {
        throw new HttpException(500, "Missing production PayFast credentials");
      }

      return {
        merchantId: process.env.PAYFAST_MERCHANT_ID,
        merchantKey: process.env.PAYFAST_MERCHANT_KEY,
        paymentUrl: "https://www.payfast.co.za",
        isProduction: true,
      };
    } else {
      return {
        merchantId: process.env.PAYFAST_MERCHANT_ID_SANDBOX || "10000100",
        merchantKey: process.env.PAYFAST_MERCHANT_KEY_SANDBOX || "46f0cd694581a",
        paymentUrl: "https://sandbox.payfast.co.za",
        isProduction: false,
      };
    }
  }

  private generatePaymentReference(userId: string, prefix: string = "ORD"): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
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
        return PaymentStatus.PENDING;
      default:
        return PaymentStatus.PENDING;
    }
  }

  private validateConfig(config: PayFastConfig): void {
    if (!config.merchantId || !config.merchantKey) {
      throw new HttpException(500, "Missing PayFast configuration - check merchant ID and key");
    }

    if (!process.env.BACKEND_URL && !process.env.API_URL) {
      throw new HttpException(500, "Missing BACKEND_URL or API_URL configuration");
    }

    if (!process.env.PAYFAST_RETURN_URL && !process.env.FRONTEND_URL) {
      throw new HttpException(500, "Missing PAYFAST_RETURN_URL or FRONTEND_URL configuration");
    }
  }
}
