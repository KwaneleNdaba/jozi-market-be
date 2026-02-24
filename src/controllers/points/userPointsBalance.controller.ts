import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { USER_POINTS_BALANCE_SERVICE_TOKEN } from "@/interfaces/points/IUserPointsBalanceService.interface";
import type { IUserPointsBalance } from "@/types/points.types";
import type { CustomResponse } from "@/types/response.interface";

export class UserPointsBalanceController {
  private readonly service: any;

  constructor() {
    this.service = Container.get(USER_POINTS_BALANCE_SERVICE_TOKEN);
  }

  public getBalance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const result = await this.service.getBalance(userId);
      const response: CustomResponse<IUserPointsBalance | null> = {
        data: result,
        message: "User points balance retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
