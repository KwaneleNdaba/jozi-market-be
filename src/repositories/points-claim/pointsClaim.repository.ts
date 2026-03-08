import { Service } from "typedi";
import { Op } from "sequelize";
import { HttpException } from "@/exceptions/HttpException";
import {
  POINTS_CLAIM_REPOSITORY_TOKEN,
  type IPointsClaimRepository,
} from "@/interfaces/points-claim/IPointsClaimRepository.interface";
import type { IPointsClaim, ICreatePointsClaim } from "@/interfaces/points-claim/IPointsClaim.interface";
import PointsClaim from "@/models/points-claim/pointsClaim.model";

@Service({ id: POINTS_CLAIM_REPOSITORY_TOKEN })
export class PointsClaimRepository implements IPointsClaimRepository {
  public async create(data: ICreatePointsClaim): Promise<IPointsClaim> {
    try {
      const claim = await PointsClaim.create(data as any);
      return claim.get({ plain: true }) as IPointsClaim;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<IPointsClaim | null> {
    try {
      const claim = await PointsClaim.findByPk(id, { raw: true });
      return claim as IPointsClaim | null;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByUserId(userId: string, limit = 50): Promise<IPointsClaim[]> {
    try {
      const claims = await PointsClaim.findAll({
        where: { userId },
        order: [["claimedAt", "DESC"]],
        limit,
        raw: true,
      });
      return claims as IPointsClaim[];
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findExpiringClaims(beforeDate: Date): Promise<IPointsClaim[]> {
    try {
      const claims = await PointsClaim.findAll({
        where: {
          expiresAt: {
            [Op.lte]: beforeDate,
          },
          isExpired: false,
          expiredAt: null,
        },
        raw: true,
      });
      return claims as IPointsClaim[];
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async markAsExpired(claimIds: string[]): Promise<number> {
    try {
      const [affectedCount] = await PointsClaim.update(
        {
          isExpired: true,
          expiredAt: new Date(),
        },
        {
          where: {
            id: {
              [Op.in]: claimIds,
            },
          },
        }
      );
      return affectedCount;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async getUserClaimStats(userId: string): Promise<{
    totalClaimed: number;
    totalExpired: number;
    activeClaims: number;
  }> {
    try {
      const allClaims = await PointsClaim.findAll({
        where: { userId },
        attributes: ["pointsClaimed", "isExpired"],
        raw: true,
      }) as any[];

      const stats = allClaims.reduce(
        (acc, claim) => {
          acc.totalClaimed += claim.pointsClaimed;
          if (claim.isExpired) {
            acc.totalExpired += claim.pointsClaimed;
          } else {
            acc.activeClaims += claim.pointsClaimed;
          }
          return acc;
        },
        { totalClaimed: 0, totalExpired: 0, activeClaims: 0 }
      );

      return stats;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }
}
