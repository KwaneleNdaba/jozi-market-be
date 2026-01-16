import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  type ISubscriptionPlanRepository,
  SUBSCRIPTION_PLAN_REPOSITORY_TOKEN,
} from "@/interfaces/subscription-plan/ISubscriptionPlanRepository.interface";
import SubscriptionPlan from "@/models/subscription-plan/subscriptionPlan.model";
import type { ISubscriptionPlan, ICreateSubscriptionPlan, IUpdateSubscriptionPlan } from "@/types/subscription.types";

@Service({ id: SUBSCRIPTION_PLAN_REPOSITORY_TOKEN })
export class SubscriptionPlanRepository implements ISubscriptionPlanRepository {
  public async create(planData: ICreateSubscriptionPlan): Promise<ISubscriptionPlan> {
    try {
      const createdPlan = await SubscriptionPlan.create(planData as any, {
        raw: false,
      });

      return createdPlan.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<ISubscriptionPlan | null> {
    try {
      const plan = await SubscriptionPlan.findByPk(id, { raw: true });
      return plan;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(status?: string): Promise<ISubscriptionPlan[]> {
    try {
      const where: any = {};
      if (status) {
        where.status = status;
      }

      const plans = await SubscriptionPlan.findAll({
        where,
        raw: true,
        order: [["createdAt", "DESC"]],
      });

      return plans;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async update(updateData: IUpdateSubscriptionPlan): Promise<ISubscriptionPlan> {
    try {
      const { id, ...updateFields } = updateData;
      const plan = await SubscriptionPlan.findByPk(id);

      if (!plan) {
        throw new HttpException(404, "Subscription plan not found");
      }

      await plan.update(updateFields as any);
      return plan.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const plan = await SubscriptionPlan.findByPk(id);

      if (!plan) {
        throw new HttpException(404, "Subscription plan not found");
      }

      await plan.destroy();
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }
}
