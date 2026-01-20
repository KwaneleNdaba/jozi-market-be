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
  product?: any; // Product details (enriched)
  createdAt?: Date;
  updatedAt?: Date;
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
