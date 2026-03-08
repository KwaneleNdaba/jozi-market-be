import type { IPointsClaim, ICreatePointsClaim } from "./IPointsClaim.interface";

export const POINTS_CLAIM_REPOSITORY_TOKEN = "IPointsClaimRepository";

export interface IPointsClaimRepository {
  create(data: ICreatePointsClaim): Promise<IPointsClaim>;
  findById(id: string): Promise<IPointsClaim | null>;
  findByUserId(userId: string, limit?: number): Promise<IPointsClaim[]>;
  findExpiringClaims(beforeDate: Date): Promise<IPointsClaim[]>;
  markAsExpired(claimIds: string[]): Promise<number>;
  getUserClaimStats(userId: string): Promise<{
    totalClaimed: number;
    totalExpired: number;
    activeClaims: number;
  }>;
}
