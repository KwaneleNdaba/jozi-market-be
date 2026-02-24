import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { TIER_SERVICE_TOKEN } from "@/interfaces/points/ITierService.interface";
import type { ITier, ICreateTier } from "@/types/points.types";
import type { CustomResponse } from "@/types/response.interface";

export class TierController {
  private readonly service: any;

  constructor() {
    this.service = Container.get(TIER_SERVICE_TOKEN);
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: ICreateTier = req.body;
      const result = await this.service.create(data);

      const response: CustomResponse<ITier> = {
        data: result,
        message: "Tier created successfully",
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

      const response: CustomResponse<ITier[]> = {
        data: results,
        message: "Tiers retrieved successfully",
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

      const response: CustomResponse<ITier | null> = {
        data: result,
        message: "Tier retrieved successfully",
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
      const data: Partial<ITier> = req.body;
      const result = await this.service.update(id, data);

      const response: CustomResponse<ITier> = {
        data: result,
        message: "Tier updated successfully",
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
        message: "Tier deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getActiveTiers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const results = await this.service.findActiveTiers();

      const response: CustomResponse<ITier[]> = {
        data: results,
        message: "Active tiers retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getByLevel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tierLevel } = req.params;
      const result = await this.service.findByLevel(Number(tierLevel));

      const response: CustomResponse<ITier | null> = {
        data: result,
        message: "Tier retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getTierByPoints = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { points } = req.params;
      const result = await this.service.findTierByPoints(Number(points));

      const response: CustomResponse<ITier | null> = {
        data: result,
        message: "Tier retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public validateTierHierarchy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      await this.service.validateTierHierarchy(data);

      const response: CustomResponse<null> = {
        data: null,
        message: "Tier hierarchy validated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public activateTier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.activateTier(id);

      const response: CustomResponse<ITier> = {
        data: result,
        message: "Tier activated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deactivateTier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deactivateTier(id);

      const response: CustomResponse<ITier> = {
        data: result,
        message: "Tier deactivated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public reorderTiers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tierIds } = req.body;
      const results = await this.service.reorderTiers(tierIds);

      const response: CustomResponse<ITier[]> = {
        data: results,
        message: "Tiers reordered successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
