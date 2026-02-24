import { Token } from "typedi";
import type { IUserPointsBalance } from "@/types/points.types";

export interface IUserPointsBalanceService {
  getBalance(userId: string): Promise<IUserPointsBalance | null>;
  incrementPendingPoints(userId: string, points: number): Promise<IUserPointsBalance>;
  confirmPendingPoints(userId: string, points: number): Promise<IUserPointsBalance>;
  deductPendingPoints(userId: string, points: number): Promise<IUserPointsBalance>;
  deductAvailablePoints(userId: string, points: number): Promise<IUserPointsBalance>;
  updateCurrentTier(userId: string, tierId: string): Promise<IUserPointsBalance>;
}

export const USER_POINTS_BALANCE_SERVICE_TOKEN = new Token<IUserPointsBalanceService>("IUserPointsBalanceService");
