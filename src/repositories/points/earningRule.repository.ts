import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  EARNING_RULE_REPOSITORY_TOKEN,
  type IEarningRuleRepository,
} from "@/interfaces/points/IEarningRuleRepository.interface";
import EarningRule from "@/models/earning-rule/earningRule.model";
import type { IEarningRule, ICreateEarningRule, SourceType } from "@/types/points.types";

@Service({ id: EARNING_RULE_REPOSITORY_TOKEN })
export class EarningRuleRepository implements IEarningRuleRepository {
  public async create(data: ICreateEarningRule): Promise<IEarningRule> {
    try {
      const rule = await EarningRule.create(data as any, { raw: false });
      return rule.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<IEarningRule | null> {
    try {
      return (await EarningRule.findOne({
        where: { id },
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(): Promise<IEarningRule[]> {
    try {
      return (await EarningRule.findAll({
        order: [["createdAt", "DESC"]],
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async update(id: string, data: Partial<IEarningRule>): Promise<IEarningRule> {
    try {
      const rule = await EarningRule.findOne({
        where: { id },
        raw: false,
      });

      if (!rule) {
        throw new HttpException(404, "EarningRule not found");
      }

      await rule.update(data);
      return rule.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const rule = await EarningRule.findOne({
        where: { id },
      });

      if (!rule) {
        throw new HttpException(404, "EarningRule not found");
      }

      await rule.destroy();
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async findEnabledRules(): Promise<IEarningRule[]> {
    try {
      return (await EarningRule.findAll({
        where: { enabled: true },
        order: [["createdAt", "DESC"]],
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findBySourceType(sourceType: SourceType): Promise<IEarningRule[]> {
    try {
      return (await EarningRule.findAll({
        where: { sourceType },
        order: [["createdAt", "DESC"]],
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByExpiryRule(expiryRuleId: string): Promise<IEarningRule[]> {
    try {
      return (await EarningRule.findAll({
        where: { expiryRuleId },
        order: [["createdAt", "DESC"]],
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }
}
