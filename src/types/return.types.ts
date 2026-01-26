export enum ReturnStatus {
  REQUESTED = "requested",
  APPROVED = "approved",
  REJECTED = "rejected",
  IN_TRANSIT = "in_transit",
  RECEIVED = "received",
  REFUND_PENDING = "refund_pending",
  REFUNDED = "refunded",
  CANCELLED = "cancelled",
}

export enum RefundStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface IReturnItem {
  id?: string;
  returnId?: string;
  orderItemId: string;
  quantity: number;
  reason?: string | null;
  status?: ReturnStatus | string;
  requestedAt?: Date;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  rejectionReason?: string | null;
  orderItem?: any; // Enriched order item details
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReturn {
  id?: string;
  orderId: string;
  userId: string;
  status: ReturnStatus | string;
  reason: string;
  requestedAt?: Date;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  rejectionReason?: string | null;
  refundAmount?: number | null;
  refundStatus?: RefundStatus | string | null;
  items?: IReturnItem[];
  order?: any; // Enriched order details
  user?: any; // Enriched user details
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateReturn {
  orderId: string;
  userId: string;
  reason: string;
  items: Array<{
    orderItemId: string;
    quantity: number;
    reason?: string;
  }>;
}

export interface ICreateReturnItem {
  returnId: string;
  orderItemId: string;
  quantity: number;
  reason?: string;
}

export interface IUpdateReturn {
  id: string;
  status?: ReturnStatus | string;
  reviewedBy?: string;
  rejectionReason?: string;
  refundAmount?: number;
  refundStatus?: RefundStatus | string;
}

export interface IUpdateReturnItem {
  id: string;
  status?: ReturnStatus | string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface IReviewReturn {
  returnId: string;
  status: ReturnStatus;
  reviewedBy: string;
  rejectionReason?: string;
}

export interface IReviewReturnItem {
  returnItemId: string;
  status: ReturnStatus;
  reviewedBy: string;
  rejectionReason?: string;
}

export interface IReturnWithDetails extends IReturn {
  items: IReturnItem[];
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    createdAt: Date;
  };
  user: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
}
