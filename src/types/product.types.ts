export enum ProductStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}

export interface IProductImage {
  index: number;
  file: string; // URL or file path
}

export interface IProductVideo {
  file: string; // URL or file path (optional)
}

export interface IInventoryData {
  quantityAvailable: number;
  quantityReserved: number;
  reorderLevel: number;
}

export interface IProductVariant {
  id?: string;
  productId?: string;
  name: string;
  sku: string;
  price?: number; // Optional: Uses product regularPrice if not set
  discountPrice?: number;
  stock: number;
  status: ProductStatus | string;
  inventory?: IInventoryData; // Real-time inventory data
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProductAttribute {
  attributeId: string;
  value: string;
}

export interface ITechnicalDetails {
  categoryId: string;
  subcategoryId?: string;
  regularPrice: number;
  discountPrice?: number;
  initialStock?: number; // Stock for products without variants
  attributes?: IProductAttribute[];
}

export interface IProduct {
  id?: string;
  userId: string;
  title: string;
  description: string;
  sku: string;
  status: ProductStatus | string;
  technicalDetails: ITechnicalDetails;
  images: IProductImage[];
  video?: IProductVideo;
  variants?: IProductVariant[];
  inventory?: IInventoryData; // Inventory data for products without variants
  vendorName?: string; // Shop name from approved vendor application
  vendorDescription?: string; // Description from vendor application
  vendorLogo?: string; // Logo URL from vendor application
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateProduct {
  userId: string;
  title: string;
  description: string;
  sku: string;
  status: ProductStatus | string;
  technicalDetails: ITechnicalDetails;
  images: IProductImage[];
  video?: IProductVideo;
  variants?: Omit<IProductVariant, "id" | "productId" | "createdAt" | "updatedAt">[];
}

export interface IUpdateProduct {
  id: string;
  userId?: string;
  title?: string;
  description?: string;
  sku?: string;
  status?: ProductStatus | string;
  technicalDetails?: ITechnicalDetails;
  images?: IProductImage[];
  video?: IProductVideo;
  variants?: Omit<IProductVariant, "id" | "productId" | "createdAt" | "updatedAt">[];
}

export interface IPaginationParams {
  page?: number;
  limit?: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
