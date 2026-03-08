import { Inject, Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  CAMPAIGN_CLAIM_REPOSITORY_TOKEN,
  type ICampaignClaimRepository,
} from "@/interfaces/campaign-claim/ICampaignClaimRepository.interface";
import {
  CAMPAIGN_CLAIM_SERVICE_TOKEN,
  type ICampaignClaimService,
} from "@/interfaces/campaign-claim/ICampaignClaimService.interface";
import {
  FREE_PRODUCT_CAMPAIGN_REPOSITORY_TOKEN,
  type IFreeProductCampaignRepository,
} from "@/interfaces/free-product-campaign/IFreeProductCampaignRepository.interface";
import {
  USER_POINTS_BALANCE_REPOSITORY_TOKEN,
  type IUserPointsBalanceRepository,
} from "@/interfaces/points/IUserPointsBalanceRepository.interface";
import {
  POINTS_HISTORY_REPOSITORY_TOKEN,
  type IPointsHistoryRepository,
} from "@/interfaces/points/IPointsHistoryRepository.interface";
import type { ICampaignClaim } from "@/types/campaignClaim.types";
import { getDownloadSignedUrl } from "@/utils/s3";
import { logger } from "@/utils/logger";

@Service({ id: CAMPAIGN_CLAIM_SERVICE_TOKEN })
export class CampaignClaimService implements ICampaignClaimService {
  constructor(
    @Inject(CAMPAIGN_CLAIM_REPOSITORY_TOKEN)
    private readonly claimRepository: ICampaignClaimRepository,
    @Inject(FREE_PRODUCT_CAMPAIGN_REPOSITORY_TOKEN)
    private readonly campaignRepository: IFreeProductCampaignRepository,
    @Inject(USER_POINTS_BALANCE_REPOSITORY_TOKEN)
    private readonly pointsBalanceRepository: IUserPointsBalanceRepository,
    @Inject(POINTS_HISTORY_REPOSITORY_TOKEN)
    private readonly pointsHistoryRepository: IPointsHistoryRepository
  ) {}

  private extractS3Key(fileUrl: string): string {
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      const urlWithoutQuery = fileUrl.split("?")[0];
      const urlParts = urlWithoutQuery.split("/");
      const keyIndex = urlParts.findIndex(part => part === "jozi-makert-files");
      if (keyIndex !== -1) return urlParts.slice(keyIndex).join("/");
      return `jozi-makert-files/${urlParts[urlParts.length - 1]}`;
    } else if (fileUrl.startsWith("jozi-makert-files/")) {
      return fileUrl;
    }
    return `jozi-makert-files/${fileUrl}`;
  }

  private async enrichClaimImages(claim: ICampaignClaim): Promise<ICampaignClaim> {
    if (!claim.campaign?.product?.images || !Array.isArray(claim.campaign.product.images)) {
      return claim;
    }

    const enrichedImages = await Promise.all(
      claim.campaign.product.images.map(async (image: any) => {
        if (!image?.file) return image;
        try {
          const s3Key = this.extractS3Key(image.file);
          const signedUrl = await getDownloadSignedUrl(s3Key, undefined, 3600);
          return { ...image, file: signedUrl };
        } catch (error) {
          logger.error("Failed to generate signed URL for campaign claim product image:", error);
          return image;
        }
      })
    );

    return {
      ...claim,
      campaign: {
        ...claim.campaign,
        product: {
          ...claim.campaign.product,
          images: enrichedImages,
        },
      },
    } as ICampaignClaim;
  }

  private async enrichManyClaims(claims: ICampaignClaim[]): Promise<ICampaignClaim[]> {
    return Promise.all(claims.map(c => this.enrichClaimImages(c)));
  }

  public async claim(userId: string, campaignId: string): Promise<ICampaignClaim> {
    try {
      // 1. Load campaign
      const campaign = await this.campaignRepository.findById(campaignId);
      if (!campaign) throw new HttpException(404, "Campaign not found");
      if (!campaign.isApproved) throw new HttpException(400, "Campaign is not approved");
      if (!campaign.isVisible) throw new HttpException(400, "Campaign is not active");
      // if (campaign.expiryDate && new Date(campaign.expiryDate) <= new Date()) {
      //   throw new HttpException(400, "Campaign has expired");
      // }
      if (campaign.quantity <= 0) throw new HttpException(400, "No items remaining in this campaign");

      // 2. Prevent duplicate claims
      const existing = await this.claimRepository.findByUserAndCampaign(userId, campaignId);
      if (existing && existing.status !== "cancelled") {
        throw new HttpException(409, "You have already claimed this campaign");
      }

      // 3. Check user has enough points
      const balance = await this.pointsBalanceRepository.findByUserId(userId);
      const available = balance?.availablePoints ?? 0;
      if (available < campaign.pointsRequired) {
        throw new HttpException(400, `Insufficient points. Required: ${campaign.pointsRequired}, available: ${available}`);
      }

      // 4. Deduct points
      if (campaign.pointsRequired > 0) {
        await this.pointsBalanceRepository.deductAvailablePoints(userId, campaign.pointsRequired);
        
        // Get updated balance to record in history
        const updatedBalance = await this.pointsBalanceRepository.findByUserId(userId);
        const balanceAfter = updatedBalance?.availablePoints ?? 0;
        
        // Create points history for the redemption
        await this.pointsHistoryRepository.create({
          userId,
          transactionType: 'redeem',
          pointsChange: -campaign.pointsRequired,
          pointsBalanceAfter: balanceAfter,
          sourceType: 'campaign_claim',
          sourceId: campaignId,
          redemptionValue: campaign.pointsRequired,
          description: `Redeemed ${campaign.pointsRequired} points for campaign product`,
          metadata: {
            campaignId,
            productId: campaign.productId,
            variantId: campaign.variantId,
          },
        });
      }

      // 5. Decrement campaign quantity and hide if no items left
      const newQuantity = campaign.quantity - 1;
      const updateData: any = { quantity: newQuantity };
      
      // Hide campaign if no items remaining
      if (newQuantity <= 0) {
        updateData.isVisible = false;
      }
      
      await this.campaignRepository.update(campaignId, updateData);

      // 6. Create claim
      const claim = await this.claimRepository.create({
        campaignId,
        userId,
      });
      
      return await this.enrichClaimImages(claim);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to claim campaign");
    }
  }

  public async fulfill(id: string): Promise<ICampaignClaim> {
    try {
      const claim = await this.claimRepository.findById(id);
      if (!claim) throw new HttpException(404, "Claim not found");
      if (claim.status !== "pending") throw new HttpException(400, `Claim is already ${claim.status}`);

      const updated = await this.claimRepository.update(id, {
        status: "fulfilled",
        fulfilledAt: new Date(),
      });
      
      return await this.enrichClaimImages(updated);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to fulfill claim");
    }
  }

  public async cancel(id: string, userId: string): Promise<ICampaignClaim> {
    try {
      const claim = await this.claimRepository.findById(id);
      if (!claim) throw new HttpException(404, "Claim not found");
      if (claim.userId !== userId) throw new HttpException(403, "You can only cancel your own claims");
      if (claim.status !== "pending") throw new HttpException(400, `Claim is already ${claim.status}`);

      // Refund points if any were deducted
      // NOTE: pointsRequired is now used from campaign, not claim
      const campaign = await this.campaignRepository.findById(claim.campaignId);
      if (campaign && campaign.pointsRequired > 0) {
        await this.pointsBalanceRepository.incrementAvailablePoints(claim.userId, campaign.pointsRequired);
        
        // Get updated balance to record in history
        const updatedBalance = await this.pointsBalanceRepository.findByUserId(claim.userId);
        const balanceAfter = updatedBalance?.availablePoints ?? 0;
        
        // Create points history for the refund
        await this.pointsHistoryRepository.create({
          userId: claim.userId,
          transactionType: 'refund',
          pointsChange: campaign.pointsRequired,
          pointsBalanceAfter: balanceAfter,
          sourceType: 'campaign_claim_cancelled',
          sourceId: claim.campaignId,
          redemptionValue: campaign.pointsRequired,
          description: `Refunded ${campaign.pointsRequired} points from cancelled campaign claim`,
          metadata: {
            campaignId: claim.campaignId,
            claimId: id,
            productId: campaign.productId,
            variantId: campaign.variantId,
          },
        });
      }

      // Restore campaign quantity and visibility
      if (campaign) {
        const newQuantity = campaign.quantity + 1;
        const updateData: any = { quantity: newQuantity };
        
        // Restore visibility if campaign was hidden due to quantity and is still approved
        if (campaign.quantity <= 0 && newQuantity > 0 && campaign.isApproved) {
          updateData.isVisible = true;
        }
        
        await this.campaignRepository.update(claim.campaignId, updateData);
      }

      const updated = await this.claimRepository.update(id, { status: "cancelled" });
      return await this.enrichClaimImages(updated);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to cancel claim");
    }
  }

  public async findById(id: string): Promise<ICampaignClaim | null> {
    try {
      const claim = await this.claimRepository.findById(id);
      return claim ? await this.enrichClaimImages(claim) : null;
    } catch (error: any) {
      throw new HttpException(500, error.message || "Failed to find claim");
    }
  }

  public async findByUserId(userId: string): Promise<ICampaignClaim[]> {
    try {
      const claims = await this.claimRepository.findByUserId(userId);
      return await this.enrichManyClaims(claims);
    } catch (error: any) {
      throw new HttpException(500, error.message || "Failed to fetch user claims");
    }
  }

  public async findByCampaignId(campaignId: string): Promise<ICampaignClaim[]> {
    try {
      const claims = await this.claimRepository.findByCampaignId(campaignId);
      return await this.enrichManyClaims(claims);
    } catch (error: any) {
      throw new HttpException(500, error.message || "Failed to fetch campaign claims");
    }
  }

  public async findAll(): Promise<ICampaignClaim[]> {
    try {
      const claims = await this.claimRepository.findAll();
      return await this.enrichManyClaims(claims);
    } catch (error: any) {
      throw new HttpException(500, error.message || "Failed to fetch claims");
    }
  }
}
