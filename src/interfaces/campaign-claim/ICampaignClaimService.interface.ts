import { Token } from "typedi";
import type { ICampaignClaim } from "@/types/campaignClaim.types";

export interface ICampaignClaimService {
  claim(userId: string, campaignId: string): Promise<ICampaignClaim>;
  fulfill(id: string): Promise<ICampaignClaim>;
  cancel(id: string, userId: string): Promise<ICampaignClaim>;
  findById(id: string): Promise<ICampaignClaim | null>;
  findByUserId(userId: string): Promise<ICampaignClaim[]>;
  findByCampaignId(campaignId: string): Promise<ICampaignClaim[]>;
  findAll(): Promise<ICampaignClaim[]>;
}

export const CAMPAIGN_CLAIM_SERVICE_TOKEN = new Token<ICampaignClaimService>("ICampaignClaimService");
