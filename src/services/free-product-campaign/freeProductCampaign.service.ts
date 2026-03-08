import { Inject, Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  FREE_PRODUCT_CAMPAIGN_REPOSITORY_TOKEN,
  type IFreeProductCampaignRepository,
} from "@/interfaces/free-product-campaign/IFreeProductCampaignRepository.interface";
import {
  FREE_PRODUCT_CAMPAIGN_SERVICE_TOKEN,
  type IFreeProductCampaignService,
} from "@/interfaces/free-product-campaign/IFreeProductCampaignService.interface";
import type { IFreeProductCampaign, ICreateFreeProductCampaign } from "@/types/freeProductCampaign.types";
import { getDownloadSignedUrl } from "@/utils/s3";
import { logger } from "@/utils/logger";

@Service({ id: FREE_PRODUCT_CAMPAIGN_SERVICE_TOKEN })
export class FreeProductCampaignService implements IFreeProductCampaignService {
  constructor(
    @Inject(FREE_PRODUCT_CAMPAIGN_REPOSITORY_TOKEN)
    private readonly repository: IFreeProductCampaignRepository
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

  private async enrichImages(campaign: IFreeProductCampaign): Promise<IFreeProductCampaign> {
    const product = (campaign as any).product;
    if (!product?.images || !Array.isArray(product.images)) return campaign;

    const enrichedImages = await Promise.all(
      product.images.map(async (image: any) => {
        if (!image?.file) return image;
        try {
          const s3Key = this.extractS3Key(image.file);
          const signedUrl = await getDownloadSignedUrl(s3Key, undefined, 3600);
          return { ...image, file: signedUrl };
        } catch (error) {
          logger.error("Failed to generate signed URL for campaign product image:", error);
          return image;
        }
      })
    );

    return {
      ...campaign,
      product: { ...product, images: enrichedImages },
    } as IFreeProductCampaign;
  }

  private async enrichMany(campaigns: IFreeProductCampaign[]): Promise<IFreeProductCampaign[]> {
    return Promise.all(campaigns.map(c => this.enrichImages(c)));
  }
  public async create(data: ICreateFreeProductCampaign): Promise<IFreeProductCampaign> {
    try {
      if (!data.vendorId) throw new HttpException(400, "vendorId is required");
      if (!data.productId) throw new HttpException(400, "productId is required");
      if (!data.quantity || data.quantity < 1) throw new HttpException(400, "quantity must be at least 1");
      if (data.pointsRequired !== undefined && data.pointsRequired < 0) throw new HttpException(400, "pointsRequired cannot be negative");
      if (data.expiryDate && new Date(data.expiryDate) <= new Date()) {
        throw new HttpException(400, "expiryDate must be in the future");
      }
      return await this.repository.create(data);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to create campaign");
    }
  }

  public async findById(id: string): Promise<IFreeProductCampaign | null> {
    try {
      const campaign = await this.repository.findById(id);
      return campaign ? await this.enrichImages(campaign) : null;
    } catch (error: any) {
      throw new HttpException(500, error.message || "Failed to find campaign");
    }
  }

  public async findAll(excludeUserId?: string): Promise<IFreeProductCampaign[]> {
    try {
      return await this.enrichMany(await this.repository.findAll(excludeUserId));
    } catch (error: any) {
      throw new HttpException(500, error.message || "Failed to fetch campaigns");
    }
  }

  public async update(id: string, data: Partial<IFreeProductCampaign>): Promise<IFreeProductCampaign> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing) throw new HttpException(404, "Campaign not found");
      if (data.expiryDate && new Date(data.expiryDate) <= new Date()) {
        throw new HttpException(400, "expiryDate must be in the future");
      }
      return await this.enrichImages(await this.repository.update(id, data));
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to update campaign");
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing) throw new HttpException(404, "Campaign not found");
      await this.repository.delete(id);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to delete campaign");
    }
  }

  public async findByVendorId(vendorId: string, excludeUserId?: string): Promise<IFreeProductCampaign[]> {
    try {
      return await this.enrichMany(await this.repository.findByVendorId(vendorId, excludeUserId));
    } catch (error: any) {
      throw new HttpException(500, error.message || "Failed to fetch vendor campaigns");
    }
  }

  public async findByProductId(productId: string, excludeUserId?: string): Promise<IFreeProductCampaign[]> {
    try {
      return await this.enrichMany(await this.repository.findByProductId(productId, excludeUserId));
    } catch (error: any) {
      throw new HttpException(500, error.message || "Failed to fetch product campaigns");
    }
  }

  public async findVisible(excludeUserId?: string): Promise<IFreeProductCampaign[]> {
    try {
      return await this.enrichMany(await this.repository.findVisible(excludeUserId));
    } catch (error: any) {
      throw new HttpException(500, error.message || "Failed to fetch visible campaigns");
    }
  }

  public async findPending(excludeUserId?: string): Promise<IFreeProductCampaign[]> {
    try {
      return await this.enrichMany(await this.repository.findPending(excludeUserId));
    } catch (error: any) {
      throw new HttpException(500, error.message || "Failed to fetch pending campaigns");
    }
  }

  public async approve(id: string): Promise<IFreeProductCampaign> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing) throw new HttpException(404, "Campaign not found");
      if (existing.isApproved) throw new HttpException(400, "Campaign is already approved");
      return await this.enrichImages(await this.repository.update(id, { isApproved: true }));
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to approve campaign");
    }
  }

  public async reject(id: string): Promise<IFreeProductCampaign> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing) throw new HttpException(404, "Campaign not found");
      return await this.enrichImages(await this.repository.update(id, { isApproved: false, isVisible: false }));
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to reject campaign");
    }
  }

  public async setVisible(id: string, visible: boolean): Promise<IFreeProductCampaign> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing) throw new HttpException(404, "Campaign not found");
      if (visible && !existing.isApproved) throw new HttpException(400, "Campaign must be approved before making it visible");
      return await this.enrichImages(await this.repository.update(id, { isVisible: visible }));
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to update visibility");
    }
  }

}
