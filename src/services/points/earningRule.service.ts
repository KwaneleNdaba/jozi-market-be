import { Inject, Service } from "typedi";
import { EARNING_RULE_REPOSITORY_TOKEN, type IEarningRuleRepository } from "@/interfaces/points/IEarningRuleRepository.interface";
import { EARNING_RULE_SERVICE_TOKEN, type IEarningRuleService } from "@/interfaces/points/IEarningRuleService.interface";
import type { IEarningRule, ICreateEarningRule, SourceType } from "@/types/points.types";
import { HttpException } from "@/exceptions/HttpException";

@Service({ id: EARNING_RULE_SERVICE_TOKEN })
export class EarningRuleService implements IEarningRuleService {
  constructor(@Inject(EARNING_RULE_REPOSITORY_TOKEN) private readonly earningRuleRepository: IEarningRuleRepository) {}

  public async create(data: ICreateEarningRule): Promise<IEarningRule> {
    try {
      return await this.earningRuleRepository.create(data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to create earning rule");
    }
  }

  public async findById(id: string): Promise<IEarningRule | null> {
    try {
      return await this.earningRuleRepository.findById(id);
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find earning rule");
    }
  }

  public async findAll(): Promise<IEarningRule[]> {
    try {
      return await this.earningRuleRepository.findAll();
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to fetch earning rules");
    }
  }

  public async update(id: string, data: Partial<IEarningRule>): Promise<IEarningRule> {
    try {
      const existing = await this.earningRuleRepository.findById(id);
      if (!existing) {
        throw new HttpException(404, "Earning rule not found");
      }

      return await this.earningRuleRepository.update(id, data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to update earning rule");
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const existing = await this.earningRuleRepository.findById(id);
      if (!existing) {
        throw new HttpException(404, "Earning rule not found");
      }

      await this.earningRuleRepository.delete(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to delete earning rule");
    }
  }

  public async findEnabledRules(): Promise<IEarningRule[]> {
    try {
      return await this.earningRuleRepository.findEnabledRules();
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find enabled rules");
    }
  }

  public async findBySourceType(sourceType: SourceType): Promise<IEarningRule[]> {
    try {
      const allRules = await this.earningRuleRepository.findAll();
      return allRules.filter(rule => rule.sourceType === sourceType);
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find rules by source type");
    }
  }

  public async findByExpiryRule(expiryRuleId: string): Promise<IEarningRule[]> {
    try {
      return await this.earningRuleRepository.findByExpiryRule(expiryRuleId);
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find rules by expiry rule");
    }
  }

  public async enableRule(id: string): Promise<IEarningRule> {
    try {
      const rule = await this.earningRuleRepository.findById(id);
      if (!rule) {
        throw new HttpException(404, "Earning rule not found");
      }

      return await this.earningRuleRepository.update(id, { enabled: true });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to enable rule");
    }
  }

  public async disableRule(id: string): Promise<IEarningRule> {
    try {
      const rule = await this.earningRuleRepository.findById(id);
      if (!rule) {
        throw new HttpException(404, "Earning rule not found");
      }

      return await this.earningRuleRepository.update(id, { enabled: false });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to disable rule");
    }
  }
}
