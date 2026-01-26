import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { RETURN_SERVICE_TOKEN } from "@/interfaces/return/IReturnService.interface";
import type { CustomResponse } from "@/types/response.interface";
import type { IReturn, IReturnItem, IReviewReturn, IReviewReturnItem } from "@/types/return.types";

export class ReturnController {
  private readonly returnService: any;

  constructor() {
    this.returnService = Container.get(RETURN_SERVICE_TOKEN);
  }

  public createReturn = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new HttpException(401, "Unauthorized");
      }

      const returnData = req.body;
      const returnRecord = await this.returnService.createReturn(userId, returnData);

      const response: CustomResponse<IReturn> = {
        data: returnRecord,
        message: "Return request created successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getReturnById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const returnRecord = await this.returnService.getReturnById(id);

      if (!returnRecord) {
        throw new HttpException(404, "Return not found");
      }

      const response: CustomResponse<IReturn> = {
        data: returnRecord,
        message: "Return retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getMyReturns = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new HttpException(401, "Unauthorized");
      }

      const returns = await this.returnService.getReturnsByUserId(userId);

      const response: CustomResponse<IReturn[]> = {
        data: returns,
        message: "Returns retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getAllReturns = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { status } = req.query;
      const returns = await this.returnService.getAllReturns(status as string);

      const response: CustomResponse<IReturn[]> = {
        data: returns,
        message: "Returns retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public reviewReturn = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const reviewData = req.body;
      const returnRecord = await this.returnService.reviewReturn(reviewData);

      const response: CustomResponse<IReturn> = {
        data: returnRecord,
        message: "Return request reviewed successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public reviewReturnItem = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const reviewData = req.body;
      const returnItem = await this.returnService.reviewReturnItem(reviewData);

      const response: CustomResponse<IReturnItem> = {
        data: returnItem,
        message: "Return item reviewed successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateReturnStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { returnId } = req.params;
      const { status } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        throw new HttpException(401, "Unauthorized");
      }

      if (!status) {
        throw new HttpException(400, "Status is required");
      }

      const returnRecord = await this.returnService.updateReturnStatus(returnId, status, userId);

      const response: CustomResponse<IReturn> = {
        data: returnRecord,
        message: "Return status updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateReturnItemStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { returnItemId } = req.params;
      const { status } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        throw new HttpException(401, "Unauthorized");
      }

      if (!status) {
        throw new HttpException(400, "Status is required");
      }

      const returnItem = await this.returnService.updateReturnItemStatus(returnItemId, status, userId);

      const response: CustomResponse<IReturnItem> = {
        data: returnItem,
        message: "Return item status updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public cancelReturn = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { returnId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        throw new HttpException(401, "Unauthorized");
      }

      const returnRecord = await this.returnService.cancelReturn(returnId, userId);

      const response: CustomResponse<IReturn> = {
        data: returnRecord,
        message: "Return cancelled successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
