import { Router } from "express";
import { GeneratePaymentDto } from "@/dots/payfast/payfast.dot";
import { authorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import { ValidationMiddleware } from "@/middlewares/ValidationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { PayFastController } from "../../controllers/payfast/payfast.controller";

export class PayFastRoute implements Routes {
  public path = "/payfast";
  public router = Router();
  public payfast = new PayFastController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Generate payment URL from cart (authenticated users only)
    this.router.post(
      `${this.path}/generate-payment`,
      authorizationMiddleware,
      ValidationMiddleware(GeneratePaymentDto),
      this.payfast.generatePayment
    );

    // Handle PayFast ITN webhook (no auth required - PayFast calls this)
    this.router.post(
      `${this.path}/notification`,
      this.payfast.handleITN
    );

    // Check payment status (authenticated users only)
    this.router.get(
      `${this.path}/status/:paymentReference`,
      authorizationMiddleware,
      this.payfast.checkPaymentStatus
    );
  }
}
