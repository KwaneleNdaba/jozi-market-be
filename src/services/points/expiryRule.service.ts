import { Inject, Service } from "typedi";
import { EXPIRY_RULE_REPOSITORY_TOKEN, type IExpiryRuleRepository } from "@/interfaces/points/IExpiryRuleRepository.interface";
import { EXPIRY_RULE_SERVICE_TOKEN, type IExpiryRuleService } from "@/interfaces/points/IExpiryRuleService.interface";
import type { IExpiryRule, ICreateExpiryRule, ExpiryType, ExpiryMode } from "@/types/points.types";
import { HttpException } from "@/exceptions/HttpException";

@Service({ id: EXPIRY_RULE_SERVICE_TOKEN })
export class ExpiryRuleService implements IExpiryRuleService {
  constructor(@Inject(EXPIRY_RULE_REPOSITORY_TOKEN) private readonly expiryRuleRepository: IExpiryRuleRepository) {}

  public async create(data: ICreateExpiryRule): Promise<IExpiryRule> {
    try {
      await this.validateExpirySettings(data);
      return await this.expiryRuleRepository.create(data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to create expiry rule");
    }
  }

  public async findById(id: string): Promise<IExpiryRule | null> {
    try {
      return await this.expiryRuleRepository.findById(id);
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find expiry rule");
    }
  }

  public async findAll(): Promise<IExpiryRule[]> {
    try {
      return await this.expiryRuleRepository.findAll();
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to fetch expiry rules");
    }
  }

  public async update(id: string, data: Partial<IExpiryRule>): Promise<IExpiryRule> {
    try {
      const existing = await this.expiryRuleRepository.findById(id);
      if (!existing) {
        throw new HttpException(404, "Expiry rule not found");
      }

      if (data.expiryType || data.expiryMode || data.expiryDays !== undefined) {
        await this.validateExpirySettings({ ...existing, ...data } as ICreateExpiryRule);
      }

      return await this.expiryRuleRepository.update(id, data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to update expiry rule");
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const existing = await this.expiryRuleRepository.findById(id);
      if (!existing) {
        throw new HttpException(404, "Expiry rule not found");
      }

      await this.expiryRuleRepository.delete(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to delete expiry rule");
    }
  }

  public async findByExpiryType(expiryType: ExpiryType): Promise<IExpiryRule[]> {
    try {
      const allRules = await this.expiryRuleRepository.findAll();
      return allRules.filter(rule => rule.expiryType === expiryType);
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find rules by expiry type");
    }
  }

  public async findByExpiryMode(expiryMode: ExpiryMode): Promise<IExpiryRule[]> {
    try {
      const allRules = await this.expiryRuleRepository.findAll();
      return allRules.filter(rule => rule.expiryMode === expiryMode);
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find rules by expiry mode");
    }
  }

  public async validateExpirySettings(data: ICreateExpiryRule | Partial<IExpiryRule>): Promise<void> {
    if (data.expiryDays !== undefined && data.expiryDays < 0) {
      throw new HttpException(400, "Expiry days cannot be negative");
    }

    if (data.gracePeriodDays !== undefined && data.gracePeriodDays < 0) {
      throw new HttpException(400, "Grace period days cannot be negative");
    }

    if (data.warningDaysBefore !== undefined && data.warningDaysBefore < 0) {
      throw new HttpException(400, "Warning days before cannot be negative");
    }

    if (data.warningDaysBefore !== undefined && data.expiryDays !== undefined && data.warningDaysBefore >= data.expiryDays) {
      throw new HttpException(400, "Warning days before must be less than expiry days");
    }
  }

  public async activateRule(id: string): Promise<IExpiryRule> {
    try {
      const rule = await this.expiryRuleRepository.findById(id);
      if (!rule) {
        throw new HttpException(404, "Expiry rule not found");
      }

      return await this.expiryRuleRepository.update(id, { active: true });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to activate rule");
    }
  }

  public async deactivateRule(id: string): Promise<IExpiryRule> {
    try {
      const rule = await this.expiryRuleRepository.findById(id);
      if (!rule) {
        throw new HttpException(404, "Expiry rule not found");
      }

      return await this.expiryRuleRepository.update(id, { active: false });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to deactivate rule");
    }
  }

  public async toggleNotifications(id: string): Promise<IExpiryRule> {
    try {
      const rule = await this.expiryRuleRepository.findById(id);
      if (!rule) {
        throw new HttpException(404, "Expiry rule not found");
      }

      return await this.expiryRuleRepository.update(id, { sendExpiryNotifications: !rule.sendExpiryNotifications });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to toggle notifications");
    }
  }

  public async calculateExpiryDate(ruleId: string, earnedDate: Date): Promise<Date> {
    try {
      const rule = await this.expiryRuleRepository.findById(ruleId);
      if (!rule) {
        throw new HttpException(404, "Expiry rule not found");
      }

      if (!rule.active) {
        throw new HttpException(400, "Cannot calculate expiry date for inactive rule");
      }

      const expiryDate = new Date(earnedDate);

      // For rolling expiry mode, add the expiry days
      if (rule.expiryMode === "rolling" && rule.expiryDays) {
        expiryDate.setDate(expiryDate.getDate() + rule.expiryDays);
      } else if (rule.expiryMode === "fixed_monthly" && rule.fixedDayOfMonth) {
        // For fixed monthly, set to specific day of next month
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        expiryDate.setDate(rule.fixedDayOfMonth);
      }

      return expiryDate;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to calculate expiry date");
    }
  }
}
