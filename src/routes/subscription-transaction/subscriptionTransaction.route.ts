import { Router } from "express";
import { SubscriptionPaymentRequestDto } from "@/dots/subscription-transaction/subscriptionTransaction.dot";
import { adminAuthorizationMiddleware, vendorAuthorizationMiddleware, authorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import { ValidationMiddleware } from "@/middlewares/ValidationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { SubscriptionTransactionController } from "../../controllers/subscription-transaction/subscriptionTransaction.controller";

export class SubscriptionTransactionRoute implements Routes {
  public path = "/subscription-transaction";
  public router = Router();
  public subscriptionTransaction = new SubscriptionTransactionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Generate subscription payment URL (vendor/admin only)
    this.router.post(
      `${this.path}/generate-payment`,
      vendorAuthorizationMiddleware,
      ValidationMiddleware(SubscriptionPaymentRequestDto),
      this.subscriptionTransaction.generateSubscriptionPayment
    );

    // Handle PayFast ITN notification (public - PayFast calls this)
    this.router.post(
      `${this.path}/notification`,
      this.subscriptionTransaction.handleSubscriptionITN
    );

    // Get transactions by user ID (authenticated)
    // IMPORTANT: This route must come before /:id to avoid route conflicts
    this.router.get(
      `${this.path}/user/:userId`,
      authorizationMiddleware,
      this.subscriptionTransaction.getTransactionsByUserId
    );

    // Get transaction by ID (authenticated)
    this.router.get(
      `${this.path}/:id`,
      authorizationMiddleware,
      this.subscriptionTransaction.getTransactionById
    );

    // Get all transactions (admin only)
    this.router.get(
      "/subscription-transactions",
      adminAuthorizationMiddleware,
      this.subscriptionTransaction.getAllTransactions
    );
  }
}
