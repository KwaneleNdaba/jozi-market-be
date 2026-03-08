export interface IFreeProductCampaignProduct {
  id: string;
  title: string;
  images: string[];
  regularPrice: number;
  discountPrice?: number | null;
  description: string;
}

export interface IFreeProductCampaignVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
}

export interface IFreeProductCampaignVendorApplication {
  id: string;
  shopName: string;
  legalName: string;
  vendorType: string;
  tagline?: string | null;
  description?: string | null;
  website?: string | null;
  status: string;
}

export interface IFreeProductCampaignVendor {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  profileUrl?: string | null;
  applicant?: IFreeProductCampaignVendorApplication | null;
}

export interface IFreeProductCampaign {
  id: string;
  vendorId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  pointsRequired: number;
  isApproved: boolean;
  isVisible: boolean;
  expiryDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  totalClaims?: number;
  product?: IFreeProductCampaignProduct;
  variant?: IFreeProductCampaignVariant | null;
  vendor?: IFreeProductCampaignVendor;
}

export interface ICreateFreeProductCampaign {
  vendorId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  pointsRequired: number;
  expiryDate?: Date | null;
}
