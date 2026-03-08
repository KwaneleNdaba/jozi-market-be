import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { FREE_PRODUCT_CAMPAIGN_SERVICE_TOKEN } from "@/interfaces/free-product-campaign/IFreeProductCampaignService.interface";
import type { IFreeProductCampaign, ICreateFreeProductCampaign } from "@/types/freeProductCampaign.types";
import type { CustomResponse } from "@/types/response.interface";

export class FreeProductCampaignController {
  private readonly service: any;

  constructor() {
    this.service = Container.get(FREE_PRODUCT_CAMPAIGN_SERVICE_TOKEN);
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: ICreateFreeProductCampaign = req.body;
      const result = await this.service.create(data);
      const response: CustomResponse<IFreeProductCampaign> = { data: result, message: "Campaign created successfully", error: false };
      res.status(201).json(response);
    } catch (error) { next(error); }
  };

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const results = await this.service.findAll(userId);
      const response: CustomResponse<IFreeProductCampaign[]> = { data: results, message: "Campaigns retrieved successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.findById(id);
      const response: CustomResponse<IFreeProductCampaign | null> = { data: result, message: "Campaign retrieved successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data: Partial<IFreeProductCampaign> = req.body;
      const result = await this.service.update(id, data);
      const response: CustomResponse<IFreeProductCampaign> = { data: result, message: "Campaign updated successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.delete(id);
      const response: CustomResponse<null> = { data: null, message: "Campaign deleted successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

  public getByVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { vendorId } = req.params;
      const userId = (req as any).user?.id;
      const results = await this.service.findByVendorId(vendorId, userId);
      const response: CustomResponse<IFreeProductCampaign[]> = { data: results, message: "Campaigns retrieved successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

  public getByProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId } = req.params;
      const userId = (req as any).user?.id;
      const results = await this.service.findByProductId(productId, userId);
      const response: CustomResponse<IFreeProductCampaign[]> = { data: results, message: "Campaigns retrieved successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

  public getVisible = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const results = await this.service.findVisible(userId);
      const response: CustomResponse<IFreeProductCampaign[]> = { data: results, message: "Visible campaigns retrieved successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

  public getPending = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const results = await this.service.findPending(userId);
      const response: CustomResponse<IFreeProductCampaign[]> = { data: results, message: "Pending campaigns retrieved successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

  public approve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.approve(id);
      const response: CustomResponse<IFreeProductCampaign> = { data: result, message: "Campaign approved successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

  public reject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.reject(id);
      const response: CustomResponse<IFreeProductCampaign> = { data: result, message: "Campaign rejected successfully", error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

  public setVisible = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { visible } = req.body;
      const result = await this.service.setVisible(id, visible);
      const response: CustomResponse<IFreeProductCampaign> = { data: result, message: `Campaign visibility set to ${visible}`, error: false };
      res.status(200).json(response);
    } catch (error) { next(error); }
  };

}
