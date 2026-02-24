import { Inject, Service } from "typedi";
import { USER_POINTS_BALANCE_REPOSITORY_TOKEN, type IUserPointsBalanceRepository } from "@/interfaces/points/IUserPointsBalanceRepository.interface";
import { USER_POINTS_BALANCE_SERVICE_TOKEN, type IUserPointsBalanceService } from "@/interfaces/points/IUserPointsBalanceService.interface";
import type { IUserPointsBalance } from "@/types/points.types";
import { HttpException } from "@/exceptions/HttpException";

@Service({ id: USER_POINTS_BALANCE_SERVICE_TOKEN })
export class UserPointsBalanceService implements IUserPointsBalanceService {
  constructor(@Inject(USER_POINTS_BALANCE_REPOSITORY_TOKEN) private readonly userPointsBalanceRepository: IUserPointsBalanceRepository) {}

  public async getBalance(userId: string): Promise<IUserPointsBalance | null> {
    try {
      return await this.userPointsBalanceRepository.findByUserId(userId);
    } catch (error: any) {
      throw new HttpException(500, error.message || "Failed to get user points balance");
    }
  }

  public async incrementPendingPoints(userId: string, points: number): Promise<IUserPointsBalance> {
    try {
      return await this.userPointsBalanceRepository.incrementPendingPoints(userId, points);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to increment pending points");
    }
  }

  public async confirmPendingPoints(userId: string, points: number): Promise<IUserPointsBalance> {
    try {
      return await this.userPointsBalanceRepository.confirmPendingPoints(userId, points);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to confirm pending points");
    }
  }

  public async deductPendingPoints(userId: string, points: number): Promise<IUserPointsBalance> {
    try {
      return await this.userPointsBalanceRepository.deductPendingPoints(userId, points);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to deduct pending points");
    }
  }

  public async deductAvailablePoints(userId: string, points: number): Promise<IUserPointsBalance> {
    try {
      return await this.userPointsBalanceRepository.deductAvailablePoints(userId, points);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to deduct available points");
    }
  }
}
