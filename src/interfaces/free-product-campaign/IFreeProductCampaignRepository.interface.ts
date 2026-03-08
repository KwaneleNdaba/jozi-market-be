import { Token } from "typedi";
import type { IFreeProductCampaign, ICreateFreeProductCampaign } from "@/types/freeProductCampaign.types";

export interface IFreeProductCampaignRepository {
  create(data: ICreateFreeProductCampaign): Promise<IFreeProductCampaign>;
  findById(id: string): Promise<IFreeProductCampaign | null>;
  findAll(excludeUserId?: string): Promise<IFreeProductCampaign[]>;
  update(id: string, data: Partial<IFreeProductCampaign>): Promise<IFreeProductCampaign>;
  delete(id: string): Promise<void>;
  findByVendorId(vendorId: string, excludeUserId?: string): Promise<IFreeProductCampaign[]>;
  findByProductId(productId: string, excludeUserId?: string): Promise<IFreeProductCampaign[]>;
  findVisible(excludeUserId?: string): Promise<IFreeProductCampaign[]>;
  findPending(excludeUserId?: string): Promise<IFreeProductCampaign[]>;
}

export const FREE_PRODUCT_CAMPAIGN_REPOSITORY_TOKEN = new Token<IFreeProductCampaignRepository>("IFreeProductCampaignRepository");
