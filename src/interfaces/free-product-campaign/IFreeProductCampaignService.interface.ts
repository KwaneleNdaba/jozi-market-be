import { Token } from "typedi";
import type { IFreeProductCampaign, ICreateFreeProductCampaign } from "@/types/freeProductCampaign.types";

export interface IFreeProductCampaignService {
  create(data: ICreateFreeProductCampaign): Promise<IFreeProductCampaign>;
  findById(id: string): Promise<IFreeProductCampaign | null>;
  findAll(excludeUserId?: string): Promise<IFreeProductCampaign[]>;
  update(id: string, data: Partial<IFreeProductCampaign>): Promise<IFreeProductCampaign>;
  delete(id: string): Promise<void>;
  findByVendorId(vendorId: string, excludeUserId?: string): Promise<IFreeProductCampaign[]>;
  findByProductId(productId: string, excludeUserId?: string): Promise<IFreeProductCampaign[]>;
  findVisible(excludeUserId?: string): Promise<IFreeProductCampaign[]>;
  findPending(excludeUserId?: string): Promise<IFreeProductCampaign[]>;
  approve(id: string): Promise<IFreeProductCampaign>;
  reject(id: string): Promise<IFreeProductCampaign>;
  setVisible(id: string, visible: boolean): Promise<IFreeProductCampaign>;
}

export const FREE_PRODUCT_CAMPAIGN_SERVICE_TOKEN = new Token<IFreeProductCampaignService>("IFreeProductCampaignService");
