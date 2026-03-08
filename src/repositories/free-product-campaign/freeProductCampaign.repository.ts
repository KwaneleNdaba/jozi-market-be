import { Service } from "typedi";
import { Op } from "sequelize";
import { HttpException } from "@/exceptions/HttpException";
import {
  FREE_PRODUCT_CAMPAIGN_REPOSITORY_TOKEN,
  type IFreeProductCampaignRepository,
} from "@/interfaces/free-product-campaign/IFreeProductCampaignRepository.interface";
import FreeProductCampaign from "@/models/free-product-campaign/freeProductCampaign.model";
import Product from "@/models/product/product.model";
import ProductVariant from "@/models/product-variant/productVariant.model";
import User from "@/models/user/user.model";
import VendorApplication from "@/models/vendor-application/vendorApplication.model";
import CampaignClaim from "@/models/campaign-claim/campaignClaim.model";
import type { IFreeProductCampaign, ICreateFreeProductCampaign } from "@/types/freeProductCampaign.types";

const CAMPAIGN_INCLUDES = [
  {
    model: Product,
    as: "product",
    attributes: ["id", "title", "images", "regularPrice", "discountPrice", "description"],
  },
  {
    model: ProductVariant,
    as: "variant",
    required: false,
    attributes: ["id", "name", "sku", "price", "discountPrice", "stock"],
  },
  {
    model: User,
    as: "vendor",
    attributes: ["id", "fullName", "email", "phone", "profileUrl"],
    include: [
      {
        model: VendorApplication,
        as: "applicant",
        required: false,
        attributes: ["id", "shopName", "legalName", "vendorType", "tagline", "description", "website", "status"],
      },
    ],
  },
  {
    model: CampaignClaim,
    as: "claims",
    attributes: [],
    required: false,
  },
];

@Service({ id: FREE_PRODUCT_CAMPAIGN_REPOSITORY_TOKEN })
export class FreeProductCampaignRepository implements IFreeProductCampaignRepository {
  private async enrichWithClaimCount(campaign: any): Promise<IFreeProductCampaign> {
    const count = await CampaignClaim.count({ where: { campaignId: campaign.id } });
    const plainCampaign = campaign.get({ plain: true });
    return { ...plainCampaign, totalClaims: count };
  }

  private async enrichManyWithClaimCount(campaigns: any[]): Promise<IFreeProductCampaign[]> {
    return Promise.all(campaigns.map(c => this.enrichWithClaimCount(c)));
  }

  public async create(data: ICreateFreeProductCampaign): Promise<IFreeProductCampaign> {
    try {
      const campaign = await FreeProductCampaign.create(data as any, { raw: false });
      return { ...campaign.get({ plain: true }), totalClaims: 0 };
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<IFreeProductCampaign | null> {
    try {
      const campaign = await FreeProductCampaign.findOne({ where: { id }, include: CAMPAIGN_INCLUDES, raw: false });
      return campaign ? await this.enrichWithClaimCount(campaign) : null;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(excludeUserId?: string): Promise<IFreeProductCampaign[]> {
    try {
      const whereClause: any = {};
      
      // If excludeUserId is provided, exclude campaigns already claimed by this user
      if (excludeUserId) {
        const userClaims = await CampaignClaim.findAll({
          where: { userId: excludeUserId },
          attributes: ['campaignId'],
          raw: true
        });
        
        const claimedCampaignIds = userClaims.map((claim: any) => claim.campaignId);
        
        if (claimedCampaignIds.length > 0) {
          whereClause.id = { [Op.notIn]: claimedCampaignIds };
        }
      }
      
      const campaigns = await FreeProductCampaign.findAll({ 
        where: whereClause,
        include: CAMPAIGN_INCLUDES, 
        order: [["createdAt", "DESC"]], 
        raw: false 
      });
      return await this.enrichManyWithClaimCount(campaigns);
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async update(id: string, data: Partial<IFreeProductCampaign>): Promise<IFreeProductCampaign> {
    try {
      const campaign = await FreeProductCampaign.findOne({ where: { id }, raw: false });
      if (!campaign) throw new HttpException(404, "Campaign not found");
      await campaign.update(data);
      const updated = await FreeProductCampaign.findOne({ where: { id }, include: CAMPAIGN_INCLUDES, raw: false });
      return await this.enrichWithClaimCount(updated!);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(409, error.message);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const campaign = await FreeProductCampaign.findOne({ where: { id } });
      if (!campaign) throw new HttpException(404, "Campaign not found");
      await campaign.destroy();
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(409, error.message);
    }
  }

  public async findByVendorId(vendorId: string, excludeUserId?: string): Promise<IFreeProductCampaign[]> {
    try {
      const whereClause: any = { vendorId };
      
      // If excludeUserId is provided, exclude campaigns already claimed by this user
      if (excludeUserId) {
        const userClaims = await CampaignClaim.findAll({
          where: { userId: excludeUserId },
          attributes: ['campaignId'],
          raw: true
        });
        
        const claimedCampaignIds = userClaims.map((claim: any) => claim.campaignId);
        
        if (claimedCampaignIds.length > 0) {
          whereClause.id = { [Op.notIn]: claimedCampaignIds };
        }
      }
      
      const campaigns = await FreeProductCampaign.findAll({ 
        where: whereClause, 
        include: CAMPAIGN_INCLUDES, 
        order: [["createdAt", "DESC"]], 
        raw: false 
      });
      return await this.enrichManyWithClaimCount(campaigns);
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByProductId(productId: string, excludeUserId?: string): Promise<IFreeProductCampaign[]> {
    try {
      const whereClause: any = { productId };
      
      // If excludeUserId is provided, exclude campaigns already claimed by this user
      if (excludeUserId) {
        const userClaims = await CampaignClaim.findAll({
          where: { userId: excludeUserId },
          attributes: ['campaignId'],
          raw: true
        });
        
        const claimedCampaignIds = userClaims.map((claim: any) => claim.campaignId);
        
        if (claimedCampaignIds.length > 0) {
          whereClause.id = { [Op.notIn]: claimedCampaignIds };
        }
      }
      
      const campaigns = await FreeProductCampaign.findAll({ 
        where: whereClause, 
        include: CAMPAIGN_INCLUDES, 
        order: [["createdAt", "DESC"]], 
        raw: false 
      });
      return await this.enrichManyWithClaimCount(campaigns);
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findVisible(excludeUserId?: string): Promise<IFreeProductCampaign[]> {
    try {
      const whereClause: any = {
        isApproved: true,
        isVisible: true,
        [Op.or]: [{ expiryDate: null }, { expiryDate: { [Op.gt]: new Date() } }],
      };
      
      // If excludeUserId is provided, exclude campaigns already claimed by this user
      if (excludeUserId) {
        const userClaims = await CampaignClaim.findAll({
          where: { userId: excludeUserId },
          attributes: ['campaignId'],
          raw: true
        });
        
        const claimedCampaignIds = userClaims.map((claim: any) => claim.campaignId);
        
        if (claimedCampaignIds.length > 0) {
          whereClause.id = { [Op.notIn]: claimedCampaignIds };
        }
      }
      
      const campaigns = await FreeProductCampaign.findAll({
        where: whereClause,
        include: CAMPAIGN_INCLUDES,
        order: [["createdAt", "DESC"]],
        raw: false,
      });
      return await this.enrichManyWithClaimCount(campaigns);
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findPending(excludeUserId?: string): Promise<IFreeProductCampaign[]> {
    try {
      const whereClause: any = { isApproved: false };
      
      // If excludeUserId is provided, exclude campaigns already claimed by this user
      if (excludeUserId) {
        const userClaims = await CampaignClaim.findAll({
          where: { userId: excludeUserId },
          attributes: ['campaignId'],
          raw: true
        });
        
        const claimedCampaignIds = userClaims.map((claim: any) => claim.campaignId);
        
        if (claimedCampaignIds.length > 0) {
          whereClause.id = { [Op.notIn]: claimedCampaignIds };
        }
      }
      
      const campaigns = await FreeProductCampaign.findAll({ 
        where: whereClause, 
        include: CAMPAIGN_INCLUDES, 
        order: [["createdAt", "DESC"]], 
        raw: false 
      });
      return await this.enrichManyWithClaimCount(campaigns);
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

}

