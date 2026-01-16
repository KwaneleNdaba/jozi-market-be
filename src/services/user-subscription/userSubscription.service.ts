import { Service, Inject } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  type IUserSubscriptionService,
  USER_SUBSCRIPTION_SERVICE_TOKEN,
} from "@/interfaces/user-subscription/IUserSubscriptionService.interface";
import {
  type IUserSubscriptionRepository,
  USER_SUBSCRIPTION_REPOSITORY_TOKEN,
} from "@/interfaces/user-subscription/IUserSubscriptionRepository.interface";
import type { IUserSubscription, ICreateUserSubscription, IUpdateUserSubscription } from "@/types/subscription.types";
import { UserSubscriptionStatus } from "@/types/subscription.types";

@Service({ id: USER_SUBSCRIPTION_SERVICE_TOKEN })
export class UserSubscriptionService implements IUserSubscriptionService {
  constructor(
    @Inject(USER_SUBSCRIPTION_REPOSITORY_TOKEN)
    private readonly userSubscriptionRepository: IUserSubscriptionRepository
  ) {}

  public async createSubscription(subscriptionData: ICreateUserSubscription): Promise<IUserSubscription> {
    try {
      // Check if user already has an active subscription
      const activeSubscription = await this.userSubscriptionRepository.findActiveByUserId(subscriptionData.userId);
      if (activeSubscription) {
        throw new HttpException(409, "User already has an active subscription");
      }

      return await this.userSubscriptionRepository.create(subscriptionData);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async getSubscriptionById(id: string): Promise<IUserSubscription | null> {
    try {
      return await this.userSubscriptionRepository.findById(id);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getSubscriptionsByUserId(userId: string, status?: string): Promise<IUserSubscription[]> {
    try {
      return await this.userSubscriptionRepository.findByUserId(userId, status);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getActiveSubscriptionByUserId(userId: string): Promise<IUserSubscription | null> {
    try {
      return await this.userSubscriptionRepository.findActiveByUserId(userId);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getAllSubscriptions(status?: string): Promise<IUserSubscription[]> {
    try {
      return await this.userSubscriptionRepository.findAll(status);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async updateSubscription(updateData: IUpdateUserSubscription): Promise<IUserSubscription> {
    try {
      return await this.userSubscriptionRepository.update(updateData);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async deleteSubscription(id: string): Promise<void> {
    try {
      await this.userSubscriptionRepository.delete(id);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }
}
