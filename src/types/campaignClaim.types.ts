import type { ClaimStatus } from "@/models/campaign-claim/campaignClaim.model";
import type { IFreeProductCampaign } from "./freeProductCampaign.types";

export interface ICampaignClaim {
  id: string;
  campaignId: string;
  userId: string;
  status: ClaimStatus;
  claimedAt: Date;
  fulfilledAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  campaign?: IFreeProductCampaign;
}

export interface ICreateCampaignClaim {
  campaignId: string;
  userId: string;
}
