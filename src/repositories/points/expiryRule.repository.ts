import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  EXPIRY_RULE_REPOSITORY_TOKEN,
  type IExpiryRuleRepository,
} from "@/interfaces/points/IExpiryRuleRepository.interface";
import ExpiryRule from "@/models/expiry-rule/expiryRule.model";
import type { IExpiryRule, ICreateExpiryRule, ExpiryType } from "@/types/points.types";

@Service({ id: EXPIRY_RULE_REPOSITORY_TOKEN })
export class ExpiryRuleRepository implements IExpiryRuleRepository {
  public async create(data: ICreateExpiryRule): Promise<IExpiryRule> {
    try {
      const rule = await ExpiryRule.create(data as any, { raw: false });
      return rule.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<IExpiryRule | null> {
    try {
      return (await ExpiryRule.findOne({
        where: { id },
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(): Promise<IExpiryRule[]> {
    try {
      return (await ExpiryRule.findAll({
        order: [["createdAt", "DESC"]],
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async update(id: string, data: Partial<IExpiryRule>): Promise<IExpiryRule> {
    try {
      const rule = await ExpiryRule.findOne({
        where: { id },
        raw: false,
      });

      if (!rule) {
        throw new HttpException(404, "ExpiryRule not found");
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
      const rule = await ExpiryRule.findOne({
        where: { id },
      });

      if (!rule) {
        throw new HttpException(404, "ExpiryRule not found");
      }

      await rule.destroy();
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async findByExpiryType(expiryType: ExpiryType): Promise<IExpiryRule | null> {
    try {
      return (await ExpiryRule.findOne({
        where: { expiryType },
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }
}
