import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  USER_POINTS_BALANCE_REPOSITORY_TOKEN,
  type IUserPointsBalanceRepository,
} from "@/interfaces/points/IUserPointsBalanceRepository.interface";
import UserPointsBalance from "@/models/user-points-balance/userPointsBalance.model";
import type { IUserPointsBalance, IUpdateUserPointsBalance } from "@/types/points.types";

@Service({ id: USER_POINTS_BALANCE_REPOSITORY_TOKEN })
export class UserPointsBalanceRepository implements IUserPointsBalanceRepository {
  public async findByUserId(userId: string): Promise<IUserPointsBalance | null> {
    try {
      return (await UserPointsBalance.findOne({ where: { userId }, raw: true })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async upsert(userId: string, data: IUpdateUserPointsBalance): Promise<IUserPointsBalance> {
    try {
      const existing = await UserPointsBalance.findOne({ where: { userId } });
      if (existing) {
        await existing.update({ ...data, lastTransactionAt: new Date() });
        return existing.get({ plain: true });
      }
      const created = await UserPointsBalance.create(
        { userId, ...data, lastTransactionAt: new Date() } as any,
        { raw: false }
      );
      return created.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async incrementPendingPoints(userId: string, points: number): Promise<IUserPointsBalance> {
    try {
      const existing = await UserPointsBalance.findOne({ where: { userId } });
      if (!existing) {
        const created = await UserPointsBalance.create(
          { userId, pendingPoints: points, lifetimeEarned: points, lastTransactionAt: new Date() } as any,
          { raw: false }
        );
        return created.get({ plain: true });
      }
      await UserPointsBalance.increment(
        { pendingPoints: points, lifetimeEarned: points },
        { where: { userId } }
      );
      await UserPointsBalance.update({ lastTransactionAt: new Date() }, { where: { userId } });
      return (await UserPointsBalance.findOne({ where: { userId }, raw: true })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async confirmPendingPoints(userId: string, points: number): Promise<IUserPointsBalance> {
    try {
      await UserPointsBalance.increment({ availablePoints: points }, { where: { userId } });
      await UserPointsBalance.decrement({ pendingPoints: points }, { where: { userId } });
      await UserPointsBalance.update({ lastTransactionAt: new Date() }, { where: { userId } });
      return (await UserPointsBalance.findOne({ where: { userId }, raw: true })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async deductPendingPoints(userId: string, points: number): Promise<IUserPointsBalance> {
    try {
      await UserPointsBalance.decrement({ pendingPoints: points }, { where: { userId } });
      await UserPointsBalance.update({ lastTransactionAt: new Date() }, { where: { userId } });
      return (await UserPointsBalance.findOne({ where: { userId }, raw: true })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async deductAvailablePoints(userId: string, points: number): Promise<IUserPointsBalance> {
    try {
      await UserPointsBalance.decrement({ availablePoints: points }, { where: { userId } });
      await UserPointsBalance.increment({ lifetimeRedeemed: points }, { where: { userId } });
      await UserPointsBalance.update({ lastTransactionAt: new Date() }, { where: { userId } });
      return (await UserPointsBalance.findOne({ where: { userId }, raw: true })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }
}
