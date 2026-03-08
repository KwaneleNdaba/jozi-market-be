export interface IPointsClaim {
  id: string;
  userId: string;
  pointsClaimed: number;
  sourceType: "purchase" | "referral" | "engagement" | "gift";
  sourceId?: string | null;
  expiryRuleId: string;
  earnedAt: Date;
  claimedAt: Date;
  expiresAt: Date;
  expiredAt?: Date | null;
  isExpired: boolean;
  pointsHistoryId?: string | null;
  metadata?: any | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatePointsClaim {
  userId: string;
  pointsClaimed: number;
  sourceType: "purchase" | "referral" | "engagement" | "gift";
  sourceId?: string | null;
  expiryRuleId: string;
  earnedAt: Date;
  claimedAt: Date;
  expiresAt: Date;
  pointsHistoryId?: string | null;
  metadata?: any | null;
}
