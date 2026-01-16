export enum SubscriptionPlanStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}

export enum SubscriptionDuration {
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export enum UserSubscriptionStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
}

export enum SubscriptionTransactionType {
  TRIAL = "trial",
  NEW = "new",
  RENEWAL = "renewal",
  UPGRADE = "upgrade",
  DOWNGRADE = "downgrade",
  CANCEL = "cancel",
  REFUND = "refund",
}

export enum SubscriptionTransactionStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

export interface ISubscriptionPlan {
  id?: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  duration: SubscriptionDuration | string;
  status: SubscriptionPlanStatus | string;
  isDark: boolean;
  isStar: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateSubscriptionPlan {
  name: string;
  subtitle: string;
  description: string;
  price: number;
  duration: SubscriptionDuration | string;
  status?: SubscriptionPlanStatus | string;
  isDark?: boolean;
  isStar?: boolean;
}

export interface IUpdateSubscriptionPlan {
  id: string;
  name?: string;
  subtitle?: string;
  description?: string;
  price?: number;
  duration?: SubscriptionDuration | string;
  status?: SubscriptionPlanStatus | string;
  isDark?: boolean;
  isStar?: boolean;
}

export interface IFeature {
  id?: string;
  name: string;
  description: string;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateFeature {
  name: string;
  description: string;
  slug: string;
}

export interface IUpdateFeature {
  id: string;
  name?: string;
  description?: string;
  slug?: string;
}

export interface ISubscriptionFeature {
  id?: string;
  subscriptionPlanId: string;
  featureId: string;
  isIncluded: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateSubscriptionFeature {
  subscriptionPlanId: string;
  featureId: string;
  isIncluded?: boolean;
}

export interface IUpdateSubscriptionFeature {
  id: string;
  subscriptionPlanId?: string;
  featureId?: string;
  isIncluded?: boolean;
}

export interface IUserSubscription {
  id?: string;
  userId: string;
  subscriptionPlanId: string;
  startDate: Date;
  endDate: Date;
  status: UserSubscriptionStatus | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateUserSubscription {
  userId: string;
  subscriptionPlanId: string;
  startDate: Date;
  endDate: Date;
  status?: UserSubscriptionStatus | string;
}

export interface IUpdateUserSubscription {
  id: string;
  userId?: string;
  subscriptionPlanId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: UserSubscriptionStatus | string;
}

export interface ISubscriptionTransaction {
  id?: string;
  userId: string;
  subscriptionPlanId: string;
  userSubscriptionId?: string | null;
  amount: number;
  currency: string;
  transactionType: SubscriptionTransactionType | string;
  status: SubscriptionTransactionStatus | string;
  paymentProvider?: string | null;
  providerReference?: string | null;
  startedAt: Date;
  endedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateSubscriptionTransaction {
  userId: string;
  subscriptionPlanId: string;
  userSubscriptionId?: string | null;
  amount: number;
  currency?: string;
  transactionType: SubscriptionTransactionType | string;
  status?: SubscriptionTransactionStatus | string;
  paymentProvider?: string | null;
  providerReference?: string | null;
  startedAt: Date;
  endedAt?: Date | null;
}

export interface IUpdateSubscriptionTransaction {
  id: string;
  status?: SubscriptionTransactionStatus | string;
  providerReference?: string | null;
  userSubscriptionId?: string | null;
  endedAt?: Date | null;
}

export interface ISubscriptionPaymentRequest {
  userId: string;
  subscriptionPlanId: string;
  email: string;
  fullName: string;
  phone: string;
  transactionType?: SubscriptionTransactionType | string;
}

export interface ISubscriptionPaymentResponse {
  paymentUrl: string;
  paymentReference: string;
  amount: number;
  merchantId: string;
  transactionId: string;
}
