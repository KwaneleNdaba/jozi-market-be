export enum ProductStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}

export interface IArtisanNotes {
  hook: string;
  story: string;
  notes: string[];
}

export interface IProductImage {
  index: number;
  file: string; // URL or file path
}

export interface IProductVideo {
  file: string; // URL or file path (optional)
}

export interface IProductVariant {
  id?: string;
  productId?: string;
  name: string;
  sku: string;
  price: number;
  discountPrice?: number;
  stock: number;
  status: ProductStatus | string;
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
  attributes?: IProductAttribute[];
}

export interface IProduct {
  id?: string;
  userId: string;
  title: string;
  description: string;
  sku: string;
  status: ProductStatus | string;
  artisanNotes: IArtisanNotes;
  technicalDetails: ITechnicalDetails;
  careGuidelines: string;
  packagingNarrative: string;
  images: IProductImage[];
  video?: IProductVideo;
  variants?: IProductVariant[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateProduct {
  userId: string;
  title: string;
  description: string;
  sku: string;
  status: ProductStatus | string;
  artisanNotes: IArtisanNotes;
  technicalDetails: ITechnicalDetails;
  careGuidelines: string;
  packagingNarrative: string;
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
  artisanNotes?: IArtisanNotes;
  technicalDetails?: ITechnicalDetails;
  careGuidelines?: string;
  packagingNarrative?: string;
  images?: IProductImage[];
  video?: IProductVideo;
  variants?: Omit<IProductVariant, "id" | "productId" | "createdAt" | "updatedAt">[];
}
