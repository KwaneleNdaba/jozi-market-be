import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { BENEFIT_SERVICE_TOKEN } from "@/interfaces/points/IBenefitService.interface";
import type { IBenefit, ICreateBenefit } from "@/types/points.types";
import type { CustomResponse } from "@/types/response.interface";

export class BenefitController {
  private readonly service: any;

  constructor() {
    this.service = Container.get(BENEFIT_SERVICE_TOKEN);
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: ICreateBenefit = req.body;
      const result = await this.service.create(data);
      const response: CustomResponse<IBenefit> = { data: result, message: "Benefit created successfully", error: false };
      res.status(201).json(response);
    } catch (error) { next(error); }
  };

  public getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const results = await this.service.findAll();
      const response: CustomResponse<IBenefit[]> = { data: results, message: "Benefits retrieved successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.findById(id);
      const response: CustomResponse<IBenefit | null> = { data: result, message: "Benefit retrieved successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data: Partial<IBenefit> = req.body;
      const result = await this.service.update(id, data);
      const response: CustomResponse<IBenefit> = { data: result, message: "Benefit updated successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.delete(id);
      const response: CustomResponse<null> = { data: null, message: "Benefit deleted successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

  public getActiveBenefits = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const results = await this.service.findActiveBenefits();
      const response: CustomResponse<IBenefit[]> = { data: results, message: "Active benefits retrieved successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

  public activateBenefit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.activateBenefit(id);
      const response: CustomResponse<IBenefit> = { data: result, message: "Benefit activated successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

  public deactivateBenefit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deactivateBenefit(id);
      const response: CustomResponse<IBenefit> = { data: result, message: "Benefit deactivated successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };
}
