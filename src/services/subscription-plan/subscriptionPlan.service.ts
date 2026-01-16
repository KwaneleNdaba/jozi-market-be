import { Service, Inject } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  type ISubscriptionPlanService,
  SUBSCRIPTION_PLAN_SERVICE_TOKEN,
} from "@/interfaces/subscription-plan/ISubscriptionPlanService.interface";
import {
  type ISubscriptionPlanRepository,
  SUBSCRIPTION_PLAN_REPOSITORY_TOKEN,
} from "@/interfaces/subscription-plan/ISubscriptionPlanRepository.interface";
import type { ISubscriptionPlan, ICreateSubscriptionPlan, IUpdateSubscriptionPlan } from "@/types/subscription.types";

@Service({ id: SUBSCRIPTION_PLAN_SERVICE_TOKEN })
export class SubscriptionPlanService implements ISubscriptionPlanService {
  constructor(
    @Inject(SUBSCRIPTION_PLAN_REPOSITORY_TOKEN)
    private readonly subscriptionPlanRepository: ISubscriptionPlanRepository
  ) {}

  public async createPlan(planData: ICreateSubscriptionPlan): Promise<ISubscriptionPlan> {
    try {
      return await this.subscriptionPlanRepository.create(planData);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async getPlanById(id: string): Promise<ISubscriptionPlan | null> {
    try {
      return await this.subscriptionPlanRepository.findById(id);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getAllPlans(status?: string): Promise<ISubscriptionPlan[]> {
    try {
      return await this.subscriptionPlanRepository.findAll(status);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async updatePlan(updateData: IUpdateSubscriptionPlan): Promise<ISubscriptionPlan> {
    try {
      return await this.subscriptionPlanRepository.update(updateData);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async deletePlan(id: string): Promise<void> {
    try {
      await this.subscriptionPlanRepository.delete(id);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }
}
