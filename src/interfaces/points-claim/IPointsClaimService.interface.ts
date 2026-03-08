import type { IPointsClaim } from "./IPointsClaim.interface";
import { Token } from "typedi";

export interface IPointsClaimService {
  claimPoints(userId: string, pointsHistoryId: string): Promise<IPointsClaim>;
  claimAllClaimablePoints(userId: string): Promise<IPointsClaim[]>;
  getUserClaims(userId: string, limit?: number): Promise<IPointsClaim[]>;
  getClaimById(claimId: string): Promise<IPointsClaim | null>;
  getClaimStats(userId: string): Promise<{
    totalClaimed: number;
    totalExpired: number;
    activeClaims: number;
  }>;
}

export const POINTS_CLAIM_SERVICE_TOKEN = new Token<IPointsClaimService>("IPointsClaimService");
