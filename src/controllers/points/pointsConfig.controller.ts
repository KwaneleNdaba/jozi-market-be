import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { POINTS_CONFIG_SERVICE_TOKEN } from "@/interfaces/points/IPointsConfigService.interface";
import type { IPointsConfig, ICreatePointsConfig } from "@/types/points.types";
import type { CustomResponse } from "@/types/response.interface";
import type { RequestWithUser } from "@/types/auth.types";

export class PointsConfigController {
  private readonly service: any;

  constructor() {
    this.service = Container.get(POINTS_CONFIG_SERVICE_TOKEN);
  }

  public create = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Log for debugging
      console.log('[PointsConfig Create] User from token:', {
        id: req.user?.id,
        email: req.user?.email,
        role: req.user?.role
      });
      
      if (!req.user?.id) {
        throw new Error('User ID not found in token');
      }
      
      const data: ICreatePointsConfig = {
        ...req.body,
        createdBy: req.user.id // Extract userId from token
      };
      
      console.log('[PointsConfig Create] Data to create:', { ...data, createdBy: data.createdBy });
      
      const result = await this.service.create(data);

      const response: CustomResponse<IPointsConfig> = {
        data: result,
        message: "Points config created successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      console.error('[PointsConfig Create] Error:', error.message);
      next(error);
    }
  };

  public getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const results = await this.service.findAll();

      const response: CustomResponse<IPointsConfig[]> = {
        data: results,
        message: "Points configs retrieved successfully",
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

      const response: CustomResponse<IPointsConfig | null> = {
        data: result,
        message: "Points config retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data: Partial<IPointsConfig> = req.body;
      
      // Remove createdBy from update data - it should never be updated
      delete data.createdBy;
      
      const result = await this.service.update(id, data);

      const response: CustomResponse<IPointsConfig> = {
        data: result,
        message: "Points config updated successfully",
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
        message: "Points config deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getActiveConfig = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.findActiveConfig();

      const response: CustomResponse<IPointsConfig | null> = {
        data: result,
        message: "Active points config retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public activateConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.activateConfig(id);

      const response: CustomResponse<IPointsConfig> = {
        data: result,
        message: "Points config activated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deactivateConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deactivateConfig(id);

      const response: CustomResponse<IPointsConfig> = {
        data: result,
        message: "Points config deactivated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getByVersion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { version } = req.params;
      const result = await this.service.findByVersion(Number(version));

      const response: CustomResponse<IPointsConfig | null> = {
        data: result,
        message: "Points config retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getConfigHistory = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const results = await this.service.getConfigHistory();

      const response: CustomResponse<IPointsConfig[]> = {
        data: results,
        message: "Config history retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public validateConfigRules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      await this.service.validateConfigRules(data);

      const response: CustomResponse<null> = {
        data: null,
        message: "Config rules validated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public cloneConfig = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const createdBy = req.user.id; // Extract userId from token
      const result = await this.service.cloneConfig(id, createdBy);

      const response: CustomResponse<IPointsConfig> = {
        data: result,
        message: "Points config cloned successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };
}
