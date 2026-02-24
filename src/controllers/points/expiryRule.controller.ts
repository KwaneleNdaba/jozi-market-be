import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { EXPIRY_RULE_SERVICE_TOKEN } from "@/interfaces/points/IExpiryRuleService.interface";
import type { IExpiryRule, ICreateExpiryRule, ExpiryType, ExpiryMode } from "@/types/points.types";
import type { CustomResponse } from "@/types/response.interface";

export class ExpiryRuleController {
  private readonly service: any;

  constructor() {
    this.service = Container.get(EXPIRY_RULE_SERVICE_TOKEN);
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: ICreateExpiryRule = req.body;
      const result = await this.service.create(data);

      const response: CustomResponse<IExpiryRule> = {
        data: result,
        message: "Expiry rule created successfully",
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

      const response: CustomResponse<IExpiryRule[]> = {
        data: results,
        message: "Expiry rules retrieved successfully",
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

      const response: CustomResponse<IExpiryRule | null> = {
        data: result,
        message: "Expiry rule retrieved successfully",
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
      const data: Partial<IExpiryRule> = req.body;
      const result = await this.service.update(id, data);

      const response: CustomResponse<IExpiryRule> = {
        data: result,
        message: "Expiry rule updated successfully",
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
        message: "Expiry rule deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getByExpiryType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { expiryType } = req.params;
      const results = await this.service.findByExpiryType(expiryType as ExpiryType);

      const response: CustomResponse<IExpiryRule[]> = {
        data: results,
        message: "Expiry rules retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getByExpiryMode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { expiryMode } = req.params;
      const results = await this.service.findByExpiryMode(expiryMode as ExpiryMode);

      const response: CustomResponse<IExpiryRule[]> = {
        data: results,
        message: "Expiry rules retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public validateExpirySettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      await this.service.validateExpirySettings(data);

      const response: CustomResponse<null> = {
        data: null,
        message: "Expiry settings validated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public activateRule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.activateRule(id);

      const response: CustomResponse<IExpiryRule> = {
        data: result,
        message: "Expiry rule activated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deactivateRule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deactivateRule(id);

      const response: CustomResponse<IExpiryRule> = {
        data: result,
        message: "Expiry rule deactivated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public toggleNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.toggleNotifications(id);

      const response: CustomResponse<IExpiryRule> = {
        data: result,
        message: "Expiry rule notifications toggled successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public calculateExpiryDate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ruleId } = req.params;
      const { earnedDate } = req.body;
      const result = await this.service.calculateExpiryDate(ruleId, new Date(earnedDate));

      const response: CustomResponse<Date> = {
        data: result,
        message: "Expiry date calculated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
