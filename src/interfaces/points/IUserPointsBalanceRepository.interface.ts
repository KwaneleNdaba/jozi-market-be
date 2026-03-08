import { Token } from "typedi";
import type { IUserPointsBalance, IUpdateUserPointsBalance, IPointsDashboardSummary } from "@/types/points.types";

export interface IUserPointsBalanceRepository {
  findByUserId(userId: string): Promise<IUserPointsBalance | null>;
  upsert(userId: string, data: IUpdateUserPointsBalance): Promise<IUserPointsBalance>;
  incrementPendingPoints(userId: string, points: number): Promise<IUserPointsBalance>;
  confirmPendingPoints(userId: string, points: number): Promise<IUserPointsBalance>;
  deductPendingPoints(userId: string, points: number): Promise<IUserPointsBalance>;
  deductAvailablePoints(userId: string, points: number): Promise<IUserPointsBalance>;
  incrementAvailablePoints(userId: string, points: number): Promise<IUserPointsBalance>;
  getDashboardSummary(userId: string): Promise<IPointsDashboardSummary>;
}

export const USER_POINTS_BALANCE_REPOSITORY_TOKEN = new Token<IUserPointsBalanceRepository>("IUserPointsBalanceRepository");
