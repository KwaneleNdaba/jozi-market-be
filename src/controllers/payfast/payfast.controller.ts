import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { PAYFAST_SERVICE_TOKEN } from "@/interfaces/payfast/IPayfastService.interface";
import type { CustomResponse } from "@/types/response.interface";
import type { PaymentResponse, PaymentStatusResponse } from "@/types/payfast.types";

export class PayFastController {
  private readonly payfastService: any;

  constructor() {
    this.payfastService = Container.get(PAYFAST_SERVICE_TOKEN);
  }

  public generatePayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new HttpException(401, "Unauthorized");
      }

      const { email, phone, fullName, deliveryAddress } = req.body;

      if (!email) {
        throw new HttpException(400, "Email is required");
      }

      const paymentData = await this.payfastService.generatePaymentFromCart({
        userId,
        email,
        phone,
        fullName,
        deliveryAddress,
      });

      const response: CustomResponse<PaymentResponse> = {
        data: paymentData,
        message: "Payment URL generated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public handleITN = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // PayFast sends data as form-urlencoded
      const itnData = req.body;
      
      console.log("📥 Received PayFast ITN:", itnData);

      const result = await this.payfastService.handlePayFastITN(itnData);

      // PayFast expects a specific response format
      if (result.success) {
        res.status(200).send("OK");
      } else {
        res.status(400).send("Error processing ITN");
      }
    } catch (error) {
      console.error("❌ Error handling ITN:", error);
      res.status(500).send("Internal server error");
    }
  };

  public checkPaymentStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { paymentReference } = req.params;

      if (!paymentReference) {
        throw new HttpException(400, "Payment reference is required");
      }

      const status = await this.payfastService.checkPaymentStatus(paymentReference);

      const response: CustomResponse<PaymentStatusResponse> = {
        data: status,
        message: "Payment status retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
