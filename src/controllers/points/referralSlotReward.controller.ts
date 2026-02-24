import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { REFERRAL_SLOT_REWARD_SERVICE_TOKEN } from "@/interfaces/points/IReferralSlotRewardService.interface";
import type { IReferralSlotReward, ICreateReferralSlotReward } from "@/types/points.types";
import type { CustomResponse } from "@/types/response.interface";

export class ReferralSlotRewardController {
  private readonly service: any;

  constructor() {
    this.service = Container.get(REFERRAL_SLOT_REWARD_SERVICE_TOKEN);
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: ICreateReferralSlotReward = req.body;
      const result = await this.service.create(data);

      const response: CustomResponse<IReferralSlotReward> = {
        data: result,
        message: "Referral slot reward created successfully",
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

      const response: CustomResponse<IReferralSlotReward[]> = {
        data: results,
        message: "Referral slot rewards retrieved successfully",
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

      const response: CustomResponse<IReferralSlotReward | null> = {
        data: result,
        message: "Referral slot reward retrieved successfully",
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
      const data: Partial<IReferralSlotReward> = req.body;
      const result = await this.service.update(id, data);

      const response: CustomResponse<IReferralSlotReward> = {
        data: result,
        message: "Referral slot reward updated successfully",
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
        message: "Referral slot reward deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getActiveSlotRewards = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const results = await this.service.findActiveSlotRewards();

      const response: CustomResponse<IReferralSlotReward[]> = {
        data: results,
        message: "Active referral slot rewards retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getByRewardConfigId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { rewardConfigId } = req.params;
      const results = await this.service.findByRewardConfigId(rewardConfigId);

      const response: CustomResponse<IReferralSlotReward[]> = {
        data: results,
        message: "Referral slot rewards retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getActiveSlotsByConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { rewardConfigId } = req.params;
      const results = await this.service.findActiveSlotsByConfig(rewardConfigId);

      const response: CustomResponse<IReferralSlotReward[]> = {
        data: results,
        message: "Active referral slot rewards retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getBySlotNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slotNumber, rewardConfigId } = req.params;
      const result = await this.service.findBySlotNumber(Number(slotNumber), rewardConfigId);

      const response: CustomResponse<IReferralSlotReward | null> = {
        data: result,
        message: "Referral slot reward retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public validateSlotNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slotNumber, rewardConfigId } = req.params;
      const { excludeId } = req.query;
      await this.service.validateSlotNumber(Number(slotNumber), rewardConfigId, excludeId as string);

      const response: CustomResponse<null> = {
        data: null,
        message: "Slot number validated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public activateSlotReward = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.activateSlotReward(id);

      const response: CustomResponse<IReferralSlotReward> = {
        data: result,
        message: "Referral slot reward activated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deactivateSlotReward = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deactivateSlotReward(id);

      const response: CustomResponse<IReferralSlotReward> = {
        data: result,
        message: "Referral slot reward deactivated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateQuantity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const result = await this.service.updateQuantity(id, quantity);

      const response: CustomResponse<IReferralSlotReward> = {
        data: result,
        message: "Referral slot reward quantity updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getNextAvailableSlot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { rewardConfigId } = req.params;
      const result = await this.service.findNextAvailableSlot(rewardConfigId);

      const response: CustomResponse<number> = {
        data: result,
        message: "Next available slot retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
