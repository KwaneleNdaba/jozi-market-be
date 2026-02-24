import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { TIER_BENEFIT_SERVICE_TOKEN } from "@/interfaces/points/ITierBenefitService.interface";
import type { ITierBenefit, ICreateTierBenefit } from "@/types/points.types";
import type { CustomResponse } from "@/types/response.interface";

export class TierBenefitController {
  private readonly service: any;

  constructor() {
    this.service = Container.get(TIER_BENEFIT_SERVICE_TOKEN);
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: ICreateTierBenefit = req.body;
      const result = await this.service.create(data);
      const response: CustomResponse<ITierBenefit> = { data: result, message: "Tier benefit created successfully", error: false };
      res.status(201).json(response);
    } catch (error) { next(error); }
  };

  public getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const results = await this.service.findAll();
      const response: CustomResponse<ITierBenefit[]> = { data: results, message: "Tier benefits retrieved successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.findById(id);
      const response: CustomResponse<ITierBenefit | null> = { data: result, message: "Tier benefit retrieved successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data: Partial<ITierBenefit> = req.body;
      const result = await this.service.update(id, data);
      const response: CustomResponse<ITierBenefit> = { data: result, message: "Tier benefit updated successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.delete(id);
      const response: CustomResponse<null> = { data: null, message: "Tier benefit deleted successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

  public getByTierId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tierId } = req.params;
      const results = await this.service.findByTierId(tierId);
      const response: CustomResponse<ITierBenefit[]> = { data: results, message: "Tier benefits retrieved successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

  public getActiveBenefits = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tierId } = req.params;
      const results = await this.service.findActiveBenefits(tierId);
      const response: CustomResponse<ITierBenefit[]> = { data: results, message: "Active tier benefits retrieved successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

  public getByBenefitId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { benefitId } = req.params;
      const results = await this.service.findByBenefitId(benefitId);
      const response: CustomResponse<ITierBenefit[]> = { data: results, message: "Tier benefits retrieved successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

  public activateBenefit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.activateBenefit(id);
      const response: CustomResponse<ITierBenefit> = { data: result, message: "Tier benefit activated successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

  public deactivateBenefit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deactivateBenefit(id);
      const response: CustomResponse<ITierBenefit> = { data: result, message: "Tier benefit deactivated successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };
}

