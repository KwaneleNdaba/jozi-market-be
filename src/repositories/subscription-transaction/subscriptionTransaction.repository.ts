import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  type ISubscriptionTransactionRepository,
  SUBSCRIPTION_TRANSACTION_REPOSITORY_TOKEN,
} from "@/interfaces/subscription-transaction/ISubscriptionTransactionRepository.interface";
import SubscriptionTransaction from "@/models/subscription-transaction/subscriptionTransaction.model";
import type { ISubscriptionTransaction, ICreateSubscriptionTransaction, IUpdateSubscriptionTransaction } from "@/types/subscription.types";

@Service({ id: SUBSCRIPTION_TRANSACTION_REPOSITORY_TOKEN })
export class SubscriptionTransactionRepository implements ISubscriptionTransactionRepository {
  public async create(transactionData: ICreateSubscriptionTransaction): Promise<ISubscriptionTransaction> {
    try {
      const createdTransaction = await SubscriptionTransaction.create({
        ...transactionData,
        currency: transactionData.currency || "ZAR",
        status: transactionData.status || "pending",
      } as any, {
        raw: false,
      });

      return createdTransaction.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<ISubscriptionTransaction | null> {
    try {
      const transaction = await SubscriptionTransaction.findByPk(id, { raw: true });
      return transaction;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByPaymentReference(paymentReference: string): Promise<ISubscriptionTransaction | null> {
    try {
      const transaction = await SubscriptionTransaction.findOne({
        where: { providerReference: paymentReference },
        raw: true,
      });
      return transaction;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByUserId(userId: string): Promise<ISubscriptionTransaction[]> {
    try {
      const transactions = await SubscriptionTransaction.findAll({
        where: { userId },
        raw: true,
        order: [["createdAt", "DESC"]],
      });

      return transactions;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByUserSubscriptionId(userSubscriptionId: string): Promise<ISubscriptionTransaction[]> {
    try {
      const transactions = await SubscriptionTransaction.findAll({
        where: { userSubscriptionId },
        raw: true,
        order: [["createdAt", "DESC"]],
      });

      return transactions;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(): Promise<ISubscriptionTransaction[]> {
    try {
      const transactions = await SubscriptionTransaction.findAll({
        raw: true,
        order: [["createdAt", "DESC"]],
      });

      return transactions;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async update(updateData: IUpdateSubscriptionTransaction): Promise<ISubscriptionTransaction> {
    try {
      const { id, ...updateFields } = updateData;
      const transaction = await SubscriptionTransaction.findByPk(id);

      if (!transaction) {
        throw new HttpException(404, "Subscription transaction not found");
      }

      await transaction.update(updateFields as any);
      return transaction.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const transaction = await SubscriptionTransaction.findByPk(id);

      if (!transaction) {
        throw new HttpException(404, "Subscription transaction not found");
      }

      await transaction.destroy();
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }
}
