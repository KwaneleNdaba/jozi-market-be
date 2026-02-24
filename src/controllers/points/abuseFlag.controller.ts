import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { ABUSE_FLAG_SERVICE_TOKEN } from "@/interfaces/points/IAbusFlagService.interface";
import type { IAbuseFlag, ICreateAbuseFlag, FlagType, FlagStatus, FlagSeverity } from "@/types/points.types";
import type { CustomResponse } from "@/types/response.interface";

export class AbuseFlagController {
  private readonly service: any;

  constructor() {
    this.service = Container.get(ABUSE_FLAG_SERVICE_TOKEN);
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: ICreateAbuseFlag = req.body;
      const result = await this.service.create(data);

      const response: CustomResponse<IAbuseFlag> = {
        data: result,
        message: "Abuse flag created successfully",
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

      const response: CustomResponse<IAbuseFlag[]> = {
        data: results,
        message: "Abuse flags retrieved successfully",
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

      const response: CustomResponse<IAbuseFlag | null> = {
        data: result,
        message: "Abuse flag retrieved successfully",
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
      const data: Partial<IAbuseFlag> = req.body;
      const result = await this.service.update(id, data);

      const response: CustomResponse<IAbuseFlag> = {
        data: result,
        message: "Abuse flag updated successfully",
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
        message: "Abuse flag deleted successfully",
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

      const response: CustomResponse<IAbuseFlag[]> = {
        data: results,
        message: "Abuse flags retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getByFlagType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { flagType } = req.params;
      const results = await this.service.findByFlagType(flagType as FlagType);

      const response: CustomResponse<IAbuseFlag[]> = {
        data: results,
        message: "Abuse flags retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getByStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = req.params;
      const results = await this.service.findByStatus(status as FlagStatus);

      const response: CustomResponse<IAbuseFlag[]> = {
        data: results,
        message: "Abuse flags retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getBySeverity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { severity } = req.params;
      const results = await this.service.findBySeverity(severity as FlagSeverity);

      const response: CustomResponse<IAbuseFlag[]> = {
        data: results,
        message: "Abuse flags retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getPendingFlags = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const results = await this.service.findPendingFlags();

      const response: CustomResponse<IAbuseFlag[]> = {
        data: results,
        message: "Pending abuse flags retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getActiveFlagsForUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const results = await this.service.findActiveFlagsForUser(userId);

      const response: CustomResponse<IAbuseFlag[]> = {
        data: results,
        message: "Active abuse flags retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public validateFlagDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { flagType, flagDetails } = req.body;
      await this.service.validateFlagDetails(flagType, flagDetails);

      const response: CustomResponse<null> = {
        data: null,
        message: "Flag details validated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public reviewFlag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { reviewedBy, reviewNotes, actionTaken } = req.body;
      const result = await this.service.reviewFlag(id, reviewedBy, reviewNotes, actionTaken);

      const response: CustomResponse<IAbuseFlag> = {
        data: result,
        message: "Abuse flag reviewed successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public resolveFlag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { isValid, reviewedBy, reviewNotes } = req.body;
      const result = await this.service.resolveFlag(id, isValid, reviewedBy, reviewNotes);

      const response: CustomResponse<IAbuseFlag> = {
        data: result,
        message: "Abuse flag resolved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public dismissFlag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { reviewedBy, reviewNotes } = req.body;
      const result = await this.service.dismissFlag(id, reviewedBy, reviewNotes);

      const response: CustomResponse<IAbuseFlag> = {
        data: result,
        message: "Abuse flag dismissed successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await this.service.updateStatus(id, status);

      const response: CustomResponse<IAbuseFlag> = {
        data: result,
        message: "Abuse flag status updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getByIpAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ipAddress } = req.params;
      const results = await this.service.findByIpAddress(ipAddress);

      const response: CustomResponse<IAbuseFlag[]> = {
        data: results,
        message: "Abuse flags retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getByDeviceFingerprint = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { deviceFingerprint } = req.params;
      const results = await this.service.findByDeviceFingerprint(deviceFingerprint);

      const response: CustomResponse<IAbuseFlag[]> = {
        data: results,
        message: "Abuse flags retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
