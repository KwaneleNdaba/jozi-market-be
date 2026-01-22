export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  RETURNED = "returned",
}

export enum ReturnRequestStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum CancellationRequestStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
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

export interface IOrderItem {
  id?: string;
  orderId?: string;
  productId: string;
  productVariantId?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  // Return request fields
  returnRequestStatus?: ReturnRequestStatus | string | null;
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
  // Return request fields
  returnRequestStatus?: ReturnRequestStatus | string | null;
  returnRequestedAt?: Date | null;
  returnReviewedBy?: string | null;
  returnReviewedAt?: Date | null;
  returnRejectionReason?: string | null;
  // Cancellation request fields
  cancellationRequestStatus?: CancellationRequestStatus | string | null;
  cancellationRequestedAt?: Date | null;
  cancellationReviewedBy?: string | null;
  cancellationReviewedAt?: Date | null;
  cancellationRejectionReason?: string | null;
  items?: IOrderItem[];
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    profileUrl?: string;
    address?: string;
  };
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
  status: ReturnRequestStatus | string;
  reviewedBy: string;
  rejectionReason?: string;
}

export interface IReviewCancellation {
  orderId: string;
  status: CancellationRequestStatus | string;
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
  status: ReturnRequestStatus | string;
  reviewedBy: string;
  rejectionReason?: string;
}
