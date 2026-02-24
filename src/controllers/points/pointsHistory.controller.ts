import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { POINTS_HISTORY_SERVICE_TOKEN } from "@/interfaces/points/IPointsHistoryService.interface";
import type { IPointsHistory } from "@/types/points.types";
import type { CustomResponse } from "@/types/response.interface";

export class PointsHistoryController {
  private readonly service: any;

  constructor() {
    this.service = Container.get(POINTS_HISTORY_SERVICE_TOKEN);
  }

  public getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const results = await this.service.findAll();
      const response: CustomResponse<IPointsHistory[]> = {
        data: results,
        message: "Points history retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const results = await this.service.findByUserId(userId);
      const response: CustomResponse<IPointsHistory[]> = {
        data: results,
        message: "Points history for user retrieved successfully",
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
      const response: CustomResponse<IPointsHistory | null> = {
        data: result,
        message: "Points history record retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
