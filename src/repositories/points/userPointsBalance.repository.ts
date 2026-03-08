import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { Op } from "sequelize";
import {
  USER_POINTS_BALANCE_REPOSITORY_TOKEN,
  type IUserPointsBalanceRepository,
} from "@/interfaces/points/IUserPointsBalanceRepository.interface";
import UserPointsBalance from "@/models/user-points-balance/userPointsBalance.model";
import PointsHistory from "@/models/points-history/pointsHistory.model";
import PointsClaim from "@/models/points-claim/pointsClaim.model";
import Tier from "@/models/tier/tier.model";
import type { IUserPointsBalance, IUpdateUserPointsBalance, IPointsDashboardSummary } from "@/types/points.types";

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

  public async incrementAvailablePoints(userId: string, points: number): Promise<IUserPointsBalance> {
    try {
      await UserPointsBalance.increment({ availablePoints: points }, { where: { userId } });
      await UserPointsBalance.update({ lastTransactionAt: new Date() }, { where: { userId } });
      return (await UserPointsBalance.findOne({ where: { userId }, raw: true })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async getDashboardSummary(userId: string): Promise<IPointsDashboardSummary> {
    try {
      // Get user balance
      const balance = await UserPointsBalance.findOne({ 
        where: { userId }, 
        raw: false 
      });

      // If no balance exists, create a default one
      if (!balance) {
        // Create initial balance record
        const newBalance = await UserPointsBalance.create({
          userId,
          availablePoints: 0,
          pendingPoints: 0,
          lifetimeEarned: 0,
          lifetimeRedeemed: 0,
          currentTierId: null,
          lastTransactionAt: null
        } as any);

        // Return default dashboard
        return {
          balance: {
            availablePoints: 0,
            pendingPoints: 0,
            totalPoints: 0
          },
          lifetime: {
            totalEarned: 0,
            totalRedeemed: 0,
            netPoints: 0
          },
          tier: null,
          recentActivity: [],
          stats: {
            pointsExpiringThisMonth: 0,
            lastTransactionAt: null,
            daysActive: 0
          }
        };
      }

      // Get current tier info if exists
      let tierInfo = null;
      if (balance.currentTierId) {
        const currentTier = await Tier.findOne({ 
          where: { id: balance.currentTierId },
          raw: true 
        }) as any;

        if (currentTier) {
          // Get next tier
          const nextTier = await Tier.findOne({
            where: {
              tierLevel: { [Op.gt]: currentTier.tierLevel },
              active: true
            },
            order: [["tierLevel", "ASC"]],
            raw: true
          }) as any;

          tierInfo = {
            id: currentTier.id,
            name: currentTier.name,
            tierLevel: currentTier.tierLevel,
            color: currentTier.color,
            multiplier: currentTier.multiplier,
            minPoints: currentTier.minPoints,
            nextTier: nextTier ? {
              name: nextTier.name,
              minPoints: nextTier.minPoints,
              pointsNeeded: Math.max(0, nextTier.minPoints - balance.lifetimeEarned)
            } : null
          };
        }
      }

      // Get recent activity (last 10 transactions)
      const recentHistory = await PointsHistory.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
        limit: 10,
        attributes: ["id", "transactionType", "pointsChange", "description", "createdAt"],
        raw: true
      }) as any;

      // Calculate points expiring soon (next 30 days) from PointsClaim records
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const expiringClaims = await PointsClaim.findAll({
        where: {
          userId,
          expiresAt: {
            [Op.lte]: thirtyDaysFromNow,
            [Op.gte]: new Date()
          },
          isExpired: false,
          expiredAt: null
        },
        attributes: ['pointsClaimed'],
        raw: true
      }) as any;

      const pointsExpiringSoon = expiringClaims.reduce((sum: number, claim: any) => {
        return sum + claim.pointsClaimed;
      }, 0);

      // Calculate days active (days since first transaction)
      const firstTransaction = await PointsHistory.findOne({
        where: { userId },
        order: [["createdAt", "ASC"]],
        attributes: ["createdAt"],
        raw: true
      }) as any;

      const daysActive = firstTransaction 
        ? Math.floor((Date.now() - new Date(firstTransaction.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      // Safely get plain balance object
      let plainBalance;
      try {
        plainBalance = balance.get({ plain: true });
      } catch (e) {
        // Fallback if .get() fails - balance might already be a plain object
        plainBalance = balance;
      }

      // Ensure we have valid values
      const availablePoints = plainBalance?.availablePoints ?? 0;
      const pendingPoints = plainBalance?.pendingPoints ?? 0;
      const lifetimeEarned = plainBalance?.lifetimeEarned ?? 0;
      const lifetimeRedeemed = plainBalance?.lifetimeRedeemed ?? 0;
      const lastTransactionAt = plainBalance?.lastTransactionAt ?? null;
      
      const totalPoints = availablePoints + pendingPoints;

      return {
        balance: {
          availablePoints,
          pendingPoints,
          totalPoints
        },
        lifetime: {
          totalEarned: lifetimeEarned,
          totalRedeemed: lifetimeRedeemed,
          netPoints: lifetimeEarned - lifetimeRedeemed
        },
        tier: tierInfo,
        recentActivity: recentHistory.map((activity: any) => ({
          id: activity.id,
          transactionType: activity.transactionType,
          pointsChange: activity.pointsChange,
          description: activity.description,
          createdAt: activity.createdAt
        })),
        stats: {
          pointsExpiringThisMonth: pointsExpiringSoon,
          lastTransactionAt,
          daysActive
        }
      };
    } catch (error: any) {
      console.error('getDashboardSummary error:', {
        userId,
        errorMessage: error.message,
        errorStack: error.stack
      });
      if (error instanceof HttpException) throw error;
      throw new HttpException(409, error.message);
    }
  }
}
