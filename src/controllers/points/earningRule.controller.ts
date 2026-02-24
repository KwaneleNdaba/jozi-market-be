import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { EARNING_RULE_SERVICE_TOKEN } from "@/interfaces/points/IEarningRuleService.interface";
import type { IEarningRule, ICreateEarningRule, SourceType } from "@/types/points.types";
import type { CustomResponse } from "@/types/response.interface";

export class EarningRuleController {
  private readonly service: any;

  constructor() {
    this.service = Container.get(EARNING_RULE_SERVICE_TOKEN);
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: ICreateEarningRule = req.body;
      const result = await this.service.create(data);

      const response: CustomResponse<IEarningRule> = {
        data: result,
        message: "Earning rule created successfully",
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

      const response: CustomResponse<IEarningRule[]> = {
        data: results,
        message: "Earning rules retrieved successfully",
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

      const response: CustomResponse<IEarningRule | null> = {
        data: result,
        message: "Earning rule retrieved successfully",
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
      const data: Partial<IEarningRule> = req.body;
      const result = await this.service.update(id, data);

      const response: CustomResponse<IEarningRule> = {
        data: result,
        message: "Earning rule updated successfully",
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
        message: "Earning rule deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getEnabledRules = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const results = await this.service.findEnabledRules();

      const response: CustomResponse<IEarningRule[]> = {
        data: results,
        message: "Enabled earning rules retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getBySourceType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sourceType } = req.params;
      const results = await this.service.findBySourceType(sourceType as SourceType);

      const response: CustomResponse<IEarningRule[]> = {
        data: results,
        message: "Earning rules retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getByExpiryRule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { expiryRuleId } = req.params;
      const results = await this.service.findByExpiryRule(expiryRuleId);

      const response: CustomResponse<IEarningRule[]> = {
        data: results,
        message: "Earning rules retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public enableRule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.enableRule(id);

      const response: CustomResponse<IEarningRule> = {
        data: result,
        message: "Earning rule enabled successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public disableRule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.disableRule(id);

      const response: CustomResponse<IEarningRule> = {
        data: result,
        message: "Earning rule disabled successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
