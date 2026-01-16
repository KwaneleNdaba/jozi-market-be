import { Service, Inject } from "typedi";
import crypto from "crypto";
import { HttpException } from "@/exceptions/HttpException";
import {
  type ISubscriptionTransactionService,
  SUBSCRIPTION_TRANSACTION_SERVICE_TOKEN,
} from "@/interfaces/subscription-transaction/ISubscriptionTransactionService.interface";
import {
  type ISubscriptionTransactionRepository,
  SUBSCRIPTION_TRANSACTION_REPOSITORY_TOKEN,
} from "@/interfaces/subscription-transaction/ISubscriptionTransactionRepository.interface";
import {
  type ISubscriptionPlanRepository,
  SUBSCRIPTION_PLAN_REPOSITORY_TOKEN,
} from "@/interfaces/subscription-plan/ISubscriptionPlanRepository.interface";
import {
  type IUserSubscriptionRepository,
  USER_SUBSCRIPTION_REPOSITORY_TOKEN,
} from "@/interfaces/user-subscription/IUserSubscriptionRepository.interface";
import type {
  ISubscriptionTransaction,
  ICreateSubscriptionTransaction,
  IUpdateSubscriptionTransaction,
  ISubscriptionPaymentRequest,
  ISubscriptionPaymentResponse,
} from "@/types/subscription.types";
import {
  SubscriptionTransactionType,
  SubscriptionTransactionStatus,
  UserSubscriptionStatus,
} from "@/types/subscription.types";

interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  paymentUrl: string;
  isProduction: boolean;
}

interface SubscriptionPaymentContext {
  userId: string;
  subscriptionPlanId: string;
  transactionId: string;
  email: string;
  fullName: string;
  phone: string;
  timestamp: number;
}

@Service({ id: SUBSCRIPTION_TRANSACTION_SERVICE_TOKEN })
export class SubscriptionTransactionService implements ISubscriptionTransactionService {
  private paymentContexts: Map<string, SubscriptionPaymentContext> = new Map();

  constructor(
    @Inject(SUBSCRIPTION_TRANSACTION_REPOSITORY_TOKEN)
    private readonly subscriptionTransactionRepository: ISubscriptionTransactionRepository,
    @Inject(SUBSCRIPTION_PLAN_REPOSITORY_TOKEN)
    private readonly subscriptionPlanRepository: ISubscriptionPlanRepository,
    @Inject(USER_SUBSCRIPTION_REPOSITORY_TOKEN)
    private readonly userSubscriptionRepository: IUserSubscriptionRepository
  ) {
    // Cleanup old contexts every hour
    setInterval(() => this.cleanupOldContexts(), 60 * 60 * 1000);
  }

  public async generateSubscriptionPayment(request: ISubscriptionPaymentRequest): Promise<ISubscriptionPaymentResponse> {
    try {
      console.log(`🚀 Generating subscription payment for user ${request.userId}, plan ${request.subscriptionPlanId}`);

      // Get subscription plan
      const plan = await this.subscriptionPlanRepository.findById(request.subscriptionPlanId);
      if (!plan) {
        throw new HttpException(404, "Subscription plan not found");
      }

      if (plan.status !== "Active") {
        throw new HttpException(400, "Subscription plan is not active");
      }

      // Check if user already has an active subscription
      const activeSubscription = await this.userSubscriptionRepository.findActiveByUserId(request.userId);
      if (activeSubscription && request.transactionType !== "upgrade" && request.transactionType !== "downgrade") {
        throw new HttpException(409, "User already has an active subscription");
      }

      const config = this.getPayFastConfig();
      this.validateConfig(config);

      // Use R5 for testing in sandbox, actual amount in production
      const finalAmount = config.isProduction ? Number(plan.price) : 5;

      if (isNaN(finalAmount) || finalAmount <= 0) {
        throw new HttpException(400, "Invalid subscription plan amount");
      }

      // Create transaction record
      const transactionType = request.transactionType || SubscriptionTransactionType.NEW;
      const transaction = await this.subscriptionTransactionRepository.create({
        userId: request.userId,
        subscriptionPlanId: request.subscriptionPlanId,
        amount: finalAmount,
        currency: "ZAR",
        transactionType,
        status: SubscriptionTransactionStatus.PENDING,
        paymentProvider: "PayFast",
        startedAt: new Date(),
      });

      const paymentReference = this.generatePaymentReference(transaction.id!);

      // Update transaction with payment reference
      await this.subscriptionTransactionRepository.update({
        id: transaction.id!,
        providerReference: paymentReference,
      });

      // Store payment context
      this.storePaymentContext(paymentReference, {
        userId: request.userId,
        subscriptionPlanId: request.subscriptionPlanId,
        transactionId: transaction.id!,
        email: request.email,
        fullName: request.fullName,
        phone: request.phone,
        timestamp: Date.now(),
      });

      // Build PayFast URL
      const paymentUrl = this.buildPayFastUrl(config, {
        amount: finalAmount,
        paymentReference,
        planName: plan.name,
        email: request.email,
      });

      console.log(`✅ Subscription payment URL generated successfully: ${paymentReference}`);

      return {
        paymentUrl,
        paymentReference,
        amount: finalAmount,
        merchantId: config.merchantId,
        transactionId: transaction.id!,
      };
    } catch (error: any) {
      console.error(`❌ Error generating subscription payment:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async handleSubscriptionITN(itnData: any): Promise<{
    success: boolean;
    transaction?: ISubscriptionTransaction;
    message: string;
  }> {
    try {
      console.log(`🔔 Processing PayFast ITN for subscription:`, {
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
        merchant_id,
        signature,
        email_address,
      } = itnData;

      if (!m_payment_id || !pf_payment_id || !payment_status || !merchant_id) {
        console.log("❌ Missing required ITN fields");
        return { success: false, message: "Missing required ITN fields" };
      }

      // Find transaction by payment reference
      const transaction = await this.subscriptionTransactionRepository.findByPaymentReference(m_payment_id);
      if (!transaction) {
        console.log(`❌ Transaction not found for payment reference: ${m_payment_id}`);
        return { success: false, message: "Transaction not found" };
      }

      // Check if already processed
      if (transaction.status === SubscriptionTransactionStatus.SUCCESS) {
        console.log(`✅ Transaction already processed: ${transaction.id}`);
        return {
          success: true,
          transaction,
          message: "Transaction already processed",
        };
      }

      // Update transaction status
      const paymentStatus = this.parsePaymentStatus(payment_status);
      const updateData: IUpdateSubscriptionTransaction = {
        id: transaction.id!,
        status: paymentStatus === "paid" ? SubscriptionTransactionStatus.SUCCESS : SubscriptionTransactionStatus.FAILED,
        endedAt: new Date(),
      };

      if (pf_payment_id) {
        updateData.providerReference = `${m_payment_id}_${pf_payment_id}`;
      }

      const updatedTransaction = await this.subscriptionTransactionRepository.update(updateData);

      // If payment successful, create or update user subscription
      if (paymentStatus === "paid") {
        await this.createOrUpdateUserSubscription(transaction);
        this.paymentContexts.delete(m_payment_id);
      }

      console.log(`✅ Subscription ITN processed successfully: ${transaction.id}`);
      return {
        success: true,
        transaction: updatedTransaction,
        message: `Payment ${paymentStatus}`,
      };
    } catch (error: any) {
      console.error("❌ Subscription ITN handling error:", error);
      return {
        success: false,
        message: `ITN processing failed: ${error.message}`,
      };
    }
  }

  private async createOrUpdateUserSubscription(transaction: ISubscriptionTransaction): Promise<void> {
    try {
      const plan = await this.subscriptionPlanRepository.findById(transaction.subscriptionPlanId);
      if (!plan) {
        throw new Error("Subscription plan not found");
      }

      // Check if user already has an active subscription
      const existingSubscription = await this.userSubscriptionRepository.findActiveByUserId(transaction.userId);

      const now = new Date();
      let endDate = new Date();

      // Calculate end date based on plan duration
      if (plan.duration === "monthly") {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (plan.duration === "yearly") {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      if (existingSubscription) {
        // Update existing subscription
        await this.userSubscriptionRepository.update({
          id: existingSubscription.id!,
          subscriptionPlanId: transaction.subscriptionPlanId,
          startDate: now,
          endDate,
          status: UserSubscriptionStatus.ACTIVE,
        });

        // Update transaction with user subscription ID
        await this.subscriptionTransactionRepository.update({
          id: transaction.id!,
          userSubscriptionId: existingSubscription.id!,
        });
      } else {
        // Create new subscription
        const newSubscription = await this.userSubscriptionRepository.create({
          userId: transaction.userId,
          subscriptionPlanId: transaction.subscriptionPlanId,
          startDate: now,
          endDate,
          status: UserSubscriptionStatus.ACTIVE,
        });

        // Update transaction with user subscription ID
        await this.subscriptionTransactionRepository.update({
          id: transaction.id!,
          userSubscriptionId: newSubscription.id!,
        });
      }

      console.log(`✅ User subscription created/updated for transaction: ${transaction.id}`);
    } catch (error: any) {
      console.error(`❌ Error creating/updating user subscription:`, error);
      throw error;
    }
  }

  private buildPayFastUrl(config: PayFastConfig, params: {
    amount: number;
    paymentReference: string;
    planName: string;
    email: string;
  }): string {
    const returnUrl = `${process.env.PAYFAST_RETURN_URL}/vendor/dashboard?paymentReference=${params.paymentReference}`;
    const cancelUrl = `${process.env.PAYFAST_CANCEL_URL || process.env.PAYFAST_RETURN_URL}/vendor/subscription?paymentReference=${params.paymentReference}&status=cancelled`;

    const paymentParams: Record<string, string> = {
      merchant_id: config.merchantId,
      merchant_key: config.merchantKey,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: `${process.env.BACKEND_URL}/api/subscription-transaction/notification`,
      m_payment_id: params.paymentReference,
      amount: params.amount.toFixed(2),
      item_name: `Subscription: ${params.planName}`,
      item_description: `Subscription plan payment - ${params.planName}`,
      email_address: params.email || "customer@example.com",
    };

    const signature = this.generateSignature(paymentParams);

    const finalParams: Record<string, string> = {
      ...paymentParams,
      signature: signature,
    };

    const queryString = Object.entries(finalParams)
      .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
      .join("&");
    const finalUrl = `${config.paymentUrl}/eng/process?${queryString}`;

    console.log("🔗 Final PayFast subscription URL generated");
    return finalUrl;
  }

  private generateSignature(params: Record<string, any>): string {
    try {
      const signatureParams = { ...params };
      delete signatureParams.signature;

      const sortedKeys = Object.keys(signatureParams).sort();
      const parameterString = sortedKeys
        .filter((key) => {
          const value = signatureParams[key];
          return value !== null && value !== undefined && value !== "";
        })
        .map((key) => `${key}=${signatureParams[key]}`)
        .join("&");

      const signature = crypto.createHash("md5").update(parameterString).digest("hex");
      console.log("🔐 Generated signature for subscription payment");

      return signature;
    } catch (error) {
      console.error("❌ Error generating signature:", error);
      throw new HttpException(500, "Failed to generate payment signature");
    }
  }

  private getPayFastConfig(): PayFastConfig {
    const isProduction = process.env.PAYFAST_ENV === "true" ? true : false;

    console.log(`🌍 PayFast Environment: ${isProduction ? "PRODUCTION" : "SANDBOX"}`);

    if (isProduction) {
      if (!process.env.PAYFAST_MERCHANT_ID || !process.env.PAYFAST_MERCHANT_KEY) {
        throw new HttpException(500, "Missing production PayFast credentials");
      }

      return {
        merchantId: process.env.PAYFAST_MERCHANT_ID,
        merchantKey: process.env.PAYFAST_MERCHANT_KEY,
        paymentUrl: "https://www.payfast.co.za",
        isProduction: isProduction,
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

  private generatePaymentReference(transactionId: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `SUB_${timestamp}_${transactionId.substring(0, 8)}_${random}`;
  }

  private parsePaymentStatus(paymentStatus: string): "paid" | "failed" | "pending" {
    const status = paymentStatus?.toUpperCase().trim();
    switch (status) {
      case "COMPLETED":
      case "COMPLETE":
      case "PAID":
      case "SUCCESS":
        return "paid";
      case "FAILED":
      case "FAILURE":
      case "ERROR":
        return "failed";
      default:
        return "pending";
    }
  }

  private storePaymentContext(paymentReference: string, context: SubscriptionPaymentContext): void {
    console.log(`💾 Storing subscription payment context for: ${paymentReference}`);
    this.paymentContexts.set(paymentReference, context);
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
      console.log(`🧹 Cleaned up ${cleaned} old subscription payment contexts`);
    }
  }

  public async createTransaction(transactionData: ICreateSubscriptionTransaction): Promise<ISubscriptionTransaction> {
    try {
      return await this.subscriptionTransactionRepository.create(transactionData);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async getTransactionById(id: string): Promise<ISubscriptionTransaction | null> {
    try {
      return await this.subscriptionTransactionRepository.findById(id);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getTransactionsByUserId(userId: string): Promise<ISubscriptionTransaction[]> {
    try {
      return await this.subscriptionTransactionRepository.findByUserId(userId);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getAllTransactions(): Promise<ISubscriptionTransaction[]> {
    try {
      return await this.subscriptionTransactionRepository.findAll();
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async updateTransaction(updateData: IUpdateSubscriptionTransaction): Promise<ISubscriptionTransaction> {
    try {
      return await this.subscriptionTransactionRepository.update(updateData);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async deleteTransaction(id: string): Promise<void> {
    try {
      await this.subscriptionTransactionRepository.delete(id);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }
}
