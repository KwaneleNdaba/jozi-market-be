// ============================================
// POINTS SYSTEM TYPES
// ============================================

// ============================================
// 1. POINTS CONFIG TYPES
// ============================================

export interface IPointsConfig {
  id: string;
  version: number;
  isActive: boolean;
  pointsEnabled: boolean;
  redemptionEnabled: boolean;
  allowStackWithDiscounts: boolean;
  createdBy?: string | null; // Optional - can be null if creator deleted
  createdAt: Date;
  updatedAt: Date;
  activatedAt?: Date | null;
  deactivatedAt?: Date | null;
}

export interface ICreatePointsConfig {
  pointsEnabled: boolean;
  redemptionEnabled: boolean;
  allowStackWithDiscounts: boolean;
  createdBy?: string; // Optional - auto-populated from token in controller
}

// ============================================
// 2. TIER TYPES
// ============================================

export type DowngradeType = 'after_inactive_days' | 'after_downgrade_threshold';

export interface ITier {
  id: string;
  name: string;
  tierLevel: number;
  color?: string | null;
  minPoints: number;
  multiplier: number;
  canGiftPoints: boolean;
  maxGiftPerMonth: number;
  expiryOverrideDays?: number | null;
  downgradeType: DowngradeType;
  downgradeDays: number;
  evaluationWindowDays: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateTier {
  name: string;
  tierLevel: number;
  color?: string;
  minPoints: number;
  multiplier: number;
  canGiftPoints: boolean;
  maxGiftPerMonth: number;
  expiryOverrideDays?: number | null;
  downgradeType: DowngradeType;
  downgradeDays: number;
  evaluationWindowDays: number;
  active?: boolean;
}

// ============================================
// 3. TIER RULE TYPES
// ============================================

// ============================================
// 4. TIER BENEFIT TYPES
// ============================================

export interface ITierBenefit {
  id: string;
  tierId: string;
  benefitId: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateTierBenefit {
  tierId: string;
  benefitId: string;
  active?: boolean;
}

// ============================================
// 5. BENEFIT (CATALOG) TYPES
// ============================================

export interface IBenefit {
  id: string;
  name: string;
  description?: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateBenefit {
  name: string;
  description?: string;
  active?: boolean;
}

// ============================================
// 6. REFERRAL REWARD CONFIG TYPES
// ============================================

export interface IReferralRewardConfig {
  id: string;
  enabled: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  signupPoints: number;
  firstPurchasePoints: number;
  minPurchaseAmount: number;
  oneRewardPerReferredUser: boolean;
  slotRewards?: IReferralSlotReward[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateReferralRewardConfig {
  enabled?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  signupPoints?: number;
  firstPurchasePoints?: number;
  minPurchaseAmount?: number;
  oneRewardPerReferredUser?: boolean;
}

// ============================================
// 7. REFERRAL SLOT REWARD TYPES
// ============================================

export interface IReferralSlotReward {
  id: string;
  rewardConfigId: string;
  slotNumber: number;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  quantity: number;
  valuePoints: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateReferralSlotReward {
  rewardConfigId: string;
  slotNumber: number;
  title: string;
  description?: string;
  fileUrl?: string;
  quantity: number;
  valuePoints: number;
  active?: boolean;
}

// ============================================
// 8. EARNING RULE TYPES
// ============================================

export type SourceType = 'purchase' | 'referral' | 'review' | 'engagement' | 'signup' | 'campaign' | 'bonus';
export type ExpiryType = 'purchase' | 'referral' | 'engagement';

export interface IEarningRule {
  id: string;
  ruleName: string;
  sourceType: SourceType;
  enabled: boolean;
  pointsAwarded: number;
  expiryRuleId: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateEarningRule {
  ruleName: string;
  sourceType: SourceType;
  enabled?: boolean;
  pointsAwarded: number;
  expiryRuleId: string;
  description?: string;
}

// ============================================
// 10. EXPIRY RULE TYPES
// ============================================

export type ExpiryMode = 'rolling' | 'fixed_monthly';

export interface IExpiryRule {
  id: string;
  expiryType: ExpiryType;
  expiryDays: number;
  expiryMode: ExpiryMode;
  fixedDayOfMonth?: number | null;
  gracePeriodDays: number;
  warningDaysBefore: number;
  sendExpiryNotifications: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateExpiryRule {
  expiryType: ExpiryType;
  expiryDays: number;
  expiryMode?: ExpiryMode;
  fixedDayOfMonth?: number;
  gracePeriodDays?: number;
  warningDaysBefore?: number;
  sendExpiryNotifications?: boolean;
  active?: boolean;
}

// ============================================
// 12. ABUSE FLAG TYPES
// ============================================

export type FlagType = 'suspicious_referral' | 'velocity_abuse' | 'redemption_abuse' | 'review_abuse' | 'device_fraud' | 'other';
export type FlagStatus = 'pending' | 'under_review' | 'resolved_valid' | 'resolved_invalid' | 'dismissed';
export type FlagSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface IAbuseFlag {
  id: string;
  userId: string;
  flagType: FlagType;
  severity: FlagSeverity;
  status: FlagStatus;
  entityType?: string | null;
  entityId?: string | null;
  detectionMethod: string;
  flagDetails: any; // JSONB
  ipAddress?: string | null;
  deviceFingerprint?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  reviewNotes?: string | null;
  actionTaken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateAbuseFlag {
  userId: string;
  flagType: FlagType;
  severity: FlagSeverity;
  status?: FlagStatus;
  entityType?: string;
  entityId?: string;
  detectionMethod: string;
  flagDetails: any;
  ipAddress?: string;
  deviceFingerprint?: string;
}

// ============================================
// 13. POINTS HISTORY TYPES
// ============================================

export type TransactionType = 'earn' | 'redeem' | 'expire' | 'adjust' | 'gift_sent' | 'gift_received' | 'refund';

export interface IPointsHistory {
  id: string;
  userId: string;
  transactionType: TransactionType;
  pointsChange: number;
  pointsBalanceAfter: number;
  sourceType: string;
  sourceId?: string | null;
  earningRuleId?: string | null;
  expiresAt?: Date | null;
  expiredAt?: Date | null;
  redemptionValue?: number | null;
  description?: string | null;
  metadata?: any | null;
  adminAdjusted: boolean;
  adminUserId?: string | null;
  adminNotes?: string | null;
  createdAt: Date;
}

export interface ICreatePointsHistory {
  userId: string;
  transactionType: TransactionType;
  pointsChange: number;
  pointsBalanceAfter: number;
  sourceType: string;
  sourceId?: string | null;
  earningRuleId?: string | null;
  expiresAt?: Date | null;
  redemptionValue?: number | null;
  description?: string | null;
  metadata?: any | null;
  adminAdjusted?: boolean;
  adminUserId?: string | null;
  adminNotes?: string | null;
}

// ============================================
// 14. USER POINTS BALANCE TYPES
// ============================================

export interface IUserPointsBalance {
  userId: string;
  availablePoints: number;
  pendingPoints: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  currentTierId?: string | null;
  lastTransactionAt?: Date | null;
  updatedAt: Date;
}

export interface IUpdateUserPointsBalance {
  availablePoints?: number;
  pendingPoints?: number;
  lifetimeEarned?: number;
  lifetimeRedeemed?: number;
  currentTierId?: string | null;
  lastTransactionAt?: Date | null;
}
