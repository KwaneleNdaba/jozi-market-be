import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { REFERRAL_REWARD_CONFIG_SERVICE_TOKEN } from "@/interfaces/points/IReferralRewardConfigService.interface";
import type { IReferralRewardConfig, ICreateReferralRewardConfig } from "@/types/points.types";
import type { CustomResponse } from "@/types/response.interface";

export class ReferralRewardConfigController {
  private readonly service: any;

  constructor() {
    this.service = Container.get(REFERRAL_REWARD_CONFIG_SERVICE_TOKEN);
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: ICreateReferralRewardConfig = req.body;
      const result = await this.service.create(data);

      const response: CustomResponse<IReferralRewardConfig> = {
        data: result,
        message: "Referral reward config created successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const results = await this.service.findAll();

      const response: CustomResponse<IReferralRewardConfig[]> = {
        data: results,
        message: "Referral reward configs retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.findById(id);

      const response: CustomResponse<IReferralRewardConfig | null> = {
        data: result,
        message: "Referral reward config retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data: Partial<IReferralRewardConfig> = req.body;
      const result = await this.service.update(id, data);

      const response: CustomResponse<IReferralRewardConfig> = {
        data: result,
        message: "Referral reward config updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.delete(id);

      const response: CustomResponse<null> = {
        data: null,
        message: "Referral reward config deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getEnabledConfigs = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const results = await this.service.findEnabledConfigs();

      const response: CustomResponse<IReferralRewardConfig[]> = {
        data: results,
        message: "Enabled referral reward configs retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public enableConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.enableConfig(id);

      const response: CustomResponse<IReferralRewardConfig> = {
        data: result,
        message: "Referral reward config enabled successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public disableConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.disableConfig(id);

      const response: CustomResponse<IReferralRewardConfig> = {
        data: result,
        message: "Referral reward config disabled successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public validateRewardAmounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      await this.service.validateRewardAmounts(data);

      const response: CustomResponse<null> = {
        data: null,
        message: "Reward amounts validated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateMinPurchaseAmount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      const result = await this.service.updateMinPurchaseAmount(id, amount);

      const response: CustomResponse<IReferralRewardConfig> = {
        data: result,
        message: "Min purchase amount updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public toggleOneRewardPerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.toggleOneRewardPerUser(id);

      const response: CustomResponse<IReferralRewardConfig> = {
        data: result,
        message: "One reward per user toggled successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
