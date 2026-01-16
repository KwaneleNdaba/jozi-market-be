export enum VendorApplicationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum VendorType {
  INDIVIDUAL = "Individual",
  BUSINESS = "Business",
}

export interface VendorAddress {
  street: string;
  city: string;
  postal: string;
  country: string;
}

export interface VendorFiles {
  logoUrl?: string;
  bannerUrl?: string;
  idDocUrl?: string;
  bankProofUrl?: string;
  addressProofUrl?: string;
  cipcDocUrl?: string;
}

export interface VendorAgreements {
  terms: boolean;
  privacy: boolean;
  popia: boolean;
  policies: boolean;
}

export interface IVendorApplication {
  id?: string;
  userId?: string | null;
  status: VendorApplicationStatus | string;
  submittedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;

  vendorType: VendorType | string;
  legalName: string;
  shopName: string;
  contactPerson: string;
  email: string;
  phone: string;

  description: string;
  website?: string;
  tagline?: string;
  cipcNumber?: string | null;
  vatNumber?: string;
  productCount: string;
  fulfillment: string;
  address: VendorAddress;
  deliveryRegions: string[];

  files: VendorFiles;

  agreements: VendorAgreements;

  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  rejectionReason?: string | null;
}

export interface ICreateVendorApplication {
  userId?: string | null;
  vendorType: VendorType | string;
  legalName: string;
  shopName: string;
  contactPerson: string;
  email: string;
  phone: string;
  description: string;
  website?: string;
  tagline?: string;
  cipcNumber?: string | null;
  vatNumber?: string;
  productCount: string;
  fulfillment: string;
  address: VendorAddress;
  deliveryRegions: string[];
  files: VendorFiles;
  agreements: VendorAgreements;
}

export interface IUpdateVendorApplicationStatus {
  id: string;
  status: VendorApplicationStatus | string;
  reviewedBy: string;
  rejectionReason?: string | null;
}
