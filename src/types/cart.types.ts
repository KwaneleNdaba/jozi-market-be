export interface IShippingAddress {
  street: string;
  city: string;
  postal: string;
  country: string;
  province?: string;
}

export interface ICartItem {
  id?: string;
  cartId?: string;
  productId: string;
  productVariantId?: string | null;
  quantity: number;
  product?: ICartProduct; // Product details (enriched)
  variant?: ICartProductVariant; // Variant details if applicable
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICartProduct {
  id: string;
  title: string;
  description?: string;
  sku: string;
  images?: Array<{
    index: number;
    file: string;
  }>;
  regularPrice?: number;
  discountPrice?: number;
  status?: string;
  variants?: ICartProductVariant[];
}

export interface ICartProductVariant {
  id: string;
  name: string;
  sku: string;
  price?: number;
  discountPrice?: number;
  stock: number;
  status: string;
}

export interface ICart {
  id?: string;
  userId: string;
  items?: ICartItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateCartItem {
  productId: string;
  productVariantId?: string | null;
  quantity: number;
}

export interface IUpdateCartItem {
  id: string;
  quantity: number;
}

export interface IAddToCart {
  productId: string;
  productVariantId?: string | null;
  quantity: number;
}
