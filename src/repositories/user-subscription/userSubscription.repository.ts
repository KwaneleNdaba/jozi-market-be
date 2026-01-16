import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  type IUserSubscriptionRepository,
  USER_SUBSCRIPTION_REPOSITORY_TOKEN,
} from "@/interfaces/user-subscription/IUserSubscriptionRepository.interface";
import UserSubscription from "@/models/user-subscription/userSubscription.model";
import type { IUserSubscription, ICreateUserSubscription, IUpdateUserSubscription } from "@/types/subscription.types";
import { UserSubscriptionStatus } from "@/types/subscription.types";

@Service({ id: USER_SUBSCRIPTION_REPOSITORY_TOKEN })
export class UserSubscriptionRepository implements IUserSubscriptionRepository {
  public async create(subscriptionData: ICreateUserSubscription): Promise<IUserSubscription> {
    try {
      const createdSubscription = await UserSubscription.create({
        ...subscriptionData,
        status: subscriptionData.status || UserSubscriptionStatus.ACTIVE,
      } as any, {
        raw: false,
      });

      return createdSubscription.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<IUserSubscription | null> {
    try {
      const subscription = await UserSubscription.findByPk(id, { raw: true });
      return subscription;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByUserId(userId: string, status?: string): Promise<IUserSubscription[]> {
    try {
      const where: any = { userId };
      if (status) {
        where.status = status;
      }

      const subscriptions = await UserSubscription.findAll({
        where,
        raw: true,
        order: [["createdAt", "DESC"]],
      });

      return subscriptions;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findActiveByUserId(userId: string): Promise<IUserSubscription | null> {
    try {
      const subscription = await UserSubscription.findOne({
        where: {
          userId,
          status: UserSubscriptionStatus.ACTIVE,
        },
        raw: true,
        order: [["createdAt", "DESC"]],
      });

      return subscription;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(status?: string): Promise<IUserSubscription[]> {
    try {
      const where: any = {};
      if (status) {
        where.status = status;
      }

      const subscriptions = await UserSubscription.findAll({
        where,
        raw: true,
        order: [["createdAt", "DESC"]],
      });

      return subscriptions;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async update(updateData: IUpdateUserSubscription): Promise<IUserSubscription> {
    try {
      const { id, ...updateFields } = updateData;
      const subscription = await UserSubscription.findByPk(id);

      if (!subscription) {
        throw new HttpException(404, "User subscription not found");
      }

      await subscription.update(updateFields as any);
      return subscription.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const subscription = await UserSubscription.findByPk(id);

      if (!subscription) {
        throw new HttpException(404, "User subscription not found");
      }

      await subscription.destroy();
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }
}
