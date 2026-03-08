import { Token } from "typedi";
import type { ICampaignClaim, ICreateCampaignClaim } from "@/types/campaignClaim.types";

export interface ICampaignClaimRepository {
  create(data: ICreateCampaignClaim): Promise<ICampaignClaim>;
  findById(id: string): Promise<ICampaignClaim | null>;
  findByUserId(userId: string): Promise<ICampaignClaim[]>;
  findByCampaignId(campaignId: string): Promise<ICampaignClaim[]>;
  findAll(): Promise<ICampaignClaim[]>;
  update(id: string, data: Partial<ICampaignClaim>): Promise<ICampaignClaim>;
  findByUserAndCampaign(userId: string, campaignId: string): Promise<ICampaignClaim | null>;
}

export const CAMPAIGN_CLAIM_REPOSITORY_TOKEN = new Token<ICampaignClaimRepository>("ICampaignClaimRepository");
