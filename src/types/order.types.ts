export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  READY_TO_SHIP = "ready_to_ship",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  RETURN_IN_PROGRESS = "return_in_progress",
  RETURNED = "returned",
  REFUND_PENDING = "refund_pending",
  REFUNDED = "refunded",
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
  RETURN_REQUESTED = "return_requested",
  RETURN_APPROVED = "return_approved",
  RETURN_REJECTED = "return_rejected",
  RETURN_IN_TRANSIT = "return_in_transit",
  RETURN_RECEIVED = "return_received",
  REFUND_PENDING = "refund_pending",
  REFUNDED = "refunded",
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
  // Rejection metadata fields (for vendor rejection)
  rejectionReason?: string | null;
  rejectedBy?: string | null;
  rejectedAt?: Date | null;
  // Return request metadata fields (status is now in status field)
  returnRequestedAt?: Date | null;
  returnQuantity?: number | null;
  returnReason?: string | null;
  returnReviewedBy?: string | null;
  returnReviewedAt?: Date | null;
  returnRejectionReason?: string | null;
  product?: any; // Product details (enriched)
  createdAt?: Date;
  updatedAt?: Date;
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
  // Return/cancellation metadata fields (status is now in status field)
  returnRequestedAt?: Date | null;
  returnReviewedBy?: string | null;
  returnReviewedAt?: Date | null;
  returnRejectionReason?: string | null;
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

export interface IRequestReturn {
  orderId: string;
  reason?: string;
}

export interface IRequestCancellation {
  orderId: string;
  reason?: string;
}

export interface IReviewReturn {
  orderId: string;
  status: OrderStatus | string; // Uses OrderStatus enum (return_in_progress, returned, etc.)
  reviewedBy: string;
  rejectionReason?: string;
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

export interface IRequestItemReturn {
  orderId: string;
  orderItemId: string;
  returnQuantity: number;
  reason?: string;
}

export interface IReviewItemReturn {
  orderId: string;
  orderItemId: string;
  status: OrderItemStatus | string; // Uses OrderItemStatus enum (return_approved, return_rejected, etc.)
  reviewedBy: string;
  rejectionReason?: string;
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
    customer?: IOrderUser;
  };
  product?: {
    id: string;
    title: string;
    sku: string;
    images?: Array<{
      index: number;
      file: string;
    }>;
  };
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
