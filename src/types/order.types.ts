export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  READY_TO_SHIP = "ready_to_ship",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export enum OrderItemStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  PROCESSING = "processing",
  PICKED = "picked",
  PACKED = "packed",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export interface IShippingAddress {
  street: string;
  city: string;
  postal: string;
  country: string;
  province?: string;
}

export interface IOrderUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  profileUrl?: string;
  address?: string;
}

export interface IOrderItem {
  id?: string;
  orderId?: string;
  productId: string;
  productVariantId?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status?: OrderItemStatus | string;
  // Return flags
  isReturnRequested?: boolean;
  isReturnApproved?: boolean;
  isReturnReviewed?: boolean;
  // Rejection metadata fields (for vendor rejection)
  rejectionReason?: string | null;
  rejectedBy?: string | null;
  rejectedAt?: Date | null;
  product?: IOrderProduct; // Product details (enriched)
  variant?: IOrderProductVariant; // Variant details if applicable
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderProduct {
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
}

export interface IOrderProductVariant {
  id: string;
  name: string;
  sku: string;
  price?: number;
  discountPrice?: number;
  status: string;
}

export interface IOrder {
  id?: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus | string;
  totalAmount: number;
  shippingAddress: IShippingAddress;
  paymentMethod: string;
  paymentStatus: PaymentStatus | string;
  email: string;
  phone?: string;
  notes?: string;
  items?: IOrderItem[];
  user?: IOrderUser;
  // Return flags
  isReturnRequested?: boolean;
  isReturnApproved?: boolean;
  isReturnReviewed?: boolean;
  // Cancellation metadata fields
  cancellationRequestedAt?: Date | null;
  cancellationReviewedBy?: string | null;
  cancellationReviewedAt?: Date | null;
  cancellationRejectionReason?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateOrder {
  userId: string;
  shippingAddress: IShippingAddress;
  paymentMethod: string;
  email: string;
  phone?: string;
  notes?: string;
}

export interface IUpdateOrder {
  id: string;
  status?: OrderStatus | string;
  paymentStatus?: PaymentStatus | string;
  notes?: string;
  totalAmount?: number;
}

export interface IRequestCancellation {
  orderId: string;
  reason?: string;
}

export interface IReviewCancellation {
  orderId: string;
  status: OrderStatus | string; // Uses OrderStatus enum (cancelled, etc.)
  reviewedBy: string;
  rejectionReason?: string;
}

export interface IOrdersGroupedByDate {
  date: string; // Date in YYYY-MM-DD format
  orders: IOrder[];
  totalOrders: number;
  totalAmount: number;
}

export interface IVendorOrdersResponse {
  vendorId: string;
  groupedOrders: IOrdersGroupedByDate[];
  totalOrders: number;
  totalAmount: number;
}

export interface IVendorDetails {
  vendorId: string;
  vendorName: string;
  contactPerson: string;
  address: {
    street: string;
    city: string;
    postal: string;
    country: string;
  };
}

export interface IOrderItemWithDetails extends IOrderItem {
  order?: {
    id: string;
    orderNumber: string;
    createdAt: Date;
    status?: OrderStatus | string;
    paymentStatus?: PaymentStatus | string;
    totalAmount?: number;
    shippingAddress?: IShippingAddress;
    email?: string;
    phone?: string;
    notes?: string;
    customer?: IOrderUser;
  };
  product?: IOrderProduct;
  variant?: IOrderProductVariant;
  vendor?: IVendorDetails;
}

export interface IOrderItemsByVendorAndDate {
  date: string; // YYYY-MM-DD format
  vendor: IVendorDetails;
  orderItems: IOrderItemWithDetails[];
  totalItems: number;
  totalAmount: number;
}

export interface IOrderItemsGroupedResponse {
  groupedItems: IOrderItemsByVendorAndDate[];
  totalItems: number;
  totalAmount: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}
