import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  CAMPAIGN_CLAIM_REPOSITORY_TOKEN,
  type ICampaignClaimRepository,
} from "@/interfaces/campaign-claim/ICampaignClaimRepository.interface";
import CampaignClaim from "@/models/campaign-claim/campaignClaim.model";
import User from "@/models/user/user.model";
import FreeProductCampaign from "@/models/free-product-campaign/freeProductCampaign.model";
import Product from "@/models/product/product.model";
import ProductVariant from "@/models/product-variant/productVariant.model";
import VendorApplication from "@/models/vendor-application/vendorApplication.model";
import type { ICampaignClaim, ICreateCampaignClaim } from "@/types/campaignClaim.types";

const CLAIM_INCLUDES = [
  {
    model: FreeProductCampaign,
    as: "campaign",
    attributes: ["id", "vendorId", "productId", "variantId", "quantity", "pointsRequired", "isApproved", "isVisible", "expiryDate", "createdAt", "updatedAt"],
    include: [
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
    ],
  },
  {
    model: User,
    as: "claimant",
    attributes: ["id", "fullName", "email", "profileUrl"],
  },
];

@Service({ id: CAMPAIGN_CLAIM_REPOSITORY_TOKEN })
export class CampaignClaimRepository implements ICampaignClaimRepository {
  public async create(data: ICreateCampaignClaim): Promise<ICampaignClaim> {
    try {
      const claim = await CampaignClaim.create({ ...data, claimedAt: new Date() } as any, { raw: false });
      const withIncludes = await CampaignClaim.findOne({ where: { id: (claim as any).id }, include: CLAIM_INCLUDES, raw: false });
      return withIncludes!.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<ICampaignClaim | null> {
    try {
      const claim = await CampaignClaim.findOne({ where: { id }, include: CLAIM_INCLUDES, raw: false });
      return claim ? claim.get({ plain: true }) : null;
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async findByUserId(userId: string): Promise<ICampaignClaim[]> {
    try {
      const claims = await CampaignClaim.findAll({ where: { userId }, include: CLAIM_INCLUDES, order: [["createdAt", "DESC"]], raw: false });
      return claims.map(c => c.get({ plain: true }));
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async findByCampaignId(campaignId: string): Promise<ICampaignClaim[]> {
    try {
      const claims = await CampaignClaim.findAll({ where: { campaignId }, include: CLAIM_INCLUDES, order: [["createdAt", "DESC"]], raw: false });
      return claims.map(c => c.get({ plain: true }));
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async findAll(): Promise<ICampaignClaim[]> {
    try {
      const claims = await CampaignClaim.findAll({ include: CLAIM_INCLUDES, order: [["createdAt", "DESC"]], raw: false });
      return claims.map(c => c.get({ plain: true }));
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async update(id: string, data: Partial<ICampaignClaim>): Promise<ICampaignClaim> {
    try {
      const claim = await CampaignClaim.findOne({ where: { id }, raw: false });
      if (!claim) throw new HttpException(404, "Claim not found");
      await claim.update(data);
      const updated = await CampaignClaim.findOne({ where: { id }, include: CLAIM_INCLUDES, raw: false });
      return updated!.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message);
    }
  }

  public async findByUserAndCampaign(userId: string, campaignId: string): Promise<ICampaignClaim | null> {
    try {
      const claim = await CampaignClaim.findOne({ where: { userId, campaignId }, include: CLAIM_INCLUDES, raw: false });
      return claim ? claim.get({ plain: true }) : null;
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }
}
