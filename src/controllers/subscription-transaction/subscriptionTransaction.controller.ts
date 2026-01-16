import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { SUBSCRIPTION_TRANSACTION_SERVICE_TOKEN } from "@/interfaces/subscription-transaction/ISubscriptionTransactionService.interface";
import type { CustomResponse } from "@/types/response.interface";
import type { ISubscriptionTransaction, ISubscriptionPaymentResponse } from "@/types/subscription.types";
import type { RequestWithUser } from "@/types/auth.types";
import { Role } from "@/types/auth.types";

export class SubscriptionTransactionController {
  private readonly subscriptionTransactionService: any;

  constructor() {
    this.subscriptionTransactionService = Container.get(SUBSCRIPTION_TRANSACTION_SERVICE_TOKEN);
  }

  public generateSubscriptionPayment = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Extract userId from authenticated user if not provided in body
      const paymentRequest = {
        ...req.body,
        userId: req.body.userId || (req.user?.id ? req.user.id : undefined),
      };

      if (!paymentRequest.userId) {
        throw new HttpException(400, "User ID is required");
      }

      const paymentResponse = await this.subscriptionTransactionService.generateSubscriptionPayment(paymentRequest);

      const response: CustomResponse<ISubscriptionPaymentResponse> = {
        data: paymentResponse,
        message: "Subscription payment URL generated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public handleSubscriptionITN = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const itnData = req.body;
      const result = await this.subscriptionTransactionService.handleSubscriptionITN(itnData);

      // PayFast expects a specific response format
      if (result.success) {
        res.status(200).send("OK");
      } else {
        res.status(400).send("FAILED");
      }
    } catch (error) {
      next(error);
    }
  };

  public getTransactionById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const transaction = await this.subscriptionTransactionService.getTransactionById(id);

      if (!transaction) {
        throw new HttpException(404, "Subscription transaction not found");
      }

      const response: CustomResponse<ISubscriptionTransaction> = {
        data: transaction,
        message: "Subscription transaction retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getTransactionsByUserId = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Get userId from params or authenticated user
      const requestedUserId = req.params.userId || req.user?.id;
      if (!requestedUserId) {
        throw new HttpException(400, "User ID is required");
      }

      // Authorization: Users can only see their own transactions, admins can see any
      if (req.user && req.user.role !== Role.ADMIN && req.user.id !== requestedUserId) {
        throw new HttpException(403, "You can only access your own transactions");
      }

      const transactions = await this.subscriptionTransactionService.getTransactionsByUserId(requestedUserId);

      const response: CustomResponse<ISubscriptionTransaction[]> = {
        data: transactions,
        message: "Subscription transactions retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getAllTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const transactions = await this.subscriptionTransactionService.getAllTransactions();

      const response: CustomResponse<ISubscriptionTransaction[]> = {
        data: transactions,
        message: "Subscription transactions retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
