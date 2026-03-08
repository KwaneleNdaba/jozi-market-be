import { Service, Inject } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  POINTS_CLAIM_SERVICE_TOKEN,
  type IPointsClaimService,
} from "@/interfaces/points-claim/IPointsClaimService.interface";
import {
  POINTS_CLAIM_REPOSITORY_TOKEN,
  type IPointsClaimRepository,
} from "@/interfaces/points-claim/IPointsClaimRepository.interface";
import {
  POINTS_HISTORY_SERVICE_TOKEN,
  type IPointsHistoryService,
} from "@/interfaces/points/IPointsHistoryService.interface";
import {
  USER_POINTS_BALANCE_SERVICE_TOKEN,
  type IUserPointsBalanceService,
} from "@/interfaces/points/IUserPointsBalanceService.interface";
import {
  EARNING_RULE_REPOSITORY_TOKEN,
  type IEarningRuleRepository,
} from "@/interfaces/points/IEarningRuleRepository.interface";
import type { IPointsClaim, ICreatePointsClaim } from "@/interfaces/points-claim/IPointsClaim.interface";

@Service({ id: POINTS_CLAIM_SERVICE_TOKEN })
export class PointsClaimService implements IPointsClaimService {
  constructor(
    @Inject(POINTS_CLAIM_REPOSITORY_TOKEN) private readonly pointsClaimRepository: IPointsClaimRepository,
    @Inject(POINTS_HISTORY_SERVICE_TOKEN) private readonly pointsHistoryService: IPointsHistoryService,
    @Inject(USER_POINTS_BALANCE_SERVICE_TOKEN) private readonly userPointsBalanceService: IUserPointsBalanceService,
    @Inject(EARNING_RULE_REPOSITORY_TOKEN) private readonly earningRuleRepository: IEarningRuleRepository
  ) {}

  /**
   * Claim points from a specific earning transaction
   */
  public async claimPoints(userId: string, pointsHistoryId: string): Promise<IPointsClaim> {
    try {
      // 1. Get the earning record
      const earningRecord = await this.pointsHistoryService.findById(pointsHistoryId);
      
      if (!earningRecord) {
        throw new HttpException(404, "Points earning record not found");
      }

      if (earningRecord.userId !== userId) {
        throw new HttpException(403, "You do not have permission to claim these points");
      }

      // Verify this is an earning transaction
      if (earningRecord.transactionType !== 'earn' && earningRecord.transactionType !== 'engagement') {
        throw new HttpException(400, "Can only claim points from earning transactions");
      }

      if (!earningRecord.earningRuleId) {
        throw new HttpException(400, "Cannot claim points without earning rule reference");
      }

      // 2. Get the EarningRule to extract sourceType and expiryRuleId
      const earningRule = await this.earningRuleRepository.findById(earningRecord.earningRuleId);
      
      if (!earningRule) {
        throw new HttpException(404, "Earning rule no longer exists");
      }

      const pointsToClaim = Math.abs(earningRecord.pointsChange);

      // 3. Get current balance and verify available points
      const balance = await this.userPointsBalanceService.getBalance(userId);
      
      if (!balance || balance.availablePoints < pointsToClaim) {
        throw new HttpException(400, `Insufficient available points. Required: ${pointsToClaim}, Available: ${balance?.availablePoints || 0}`);
      }

      // 4. Deduct from available (since points are already available)
      // This would be for manual retroactive claiming only
      await this.deductAvailablePoints(userId, pointsToClaim);
      
      // Move back to available (no-op in auto-award scenario)
      await this.incrementAvailablePoints(userId, pointsToClaim);

      // 5. Create PointsClaim record
      const claimedAt = new Date();
      const claimData: ICreatePointsClaim = {
        userId,
        pointsClaimed: pointsToClaim,
        sourceType: earningRule.sourceType as any,
        sourceId: earningRecord.sourceId || null,
        expiryRuleId: earningRule.expiryRuleId,
        earnedAt: earningRecord.createdAt,
        claimedAt,
        expiresAt: earningRecord.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Fallback to 1 year
        pointsHistoryId: earningRecord.id,
        metadata: {
          earningRuleId: earningRule.id,
          ruleName: earningRule.ruleName,
          originalTransaction: earningRecord.transactionType
        }
      };

      const claim = await this.pointsClaimRepository.create(claimData);

      // 6. Record claim transaction in PointsHistory
      const currentBalance = await this.userPointsBalanceService.getBalance(userId);
      const pointsBalanceAfter = (currentBalance?.availablePoints || 0) + (currentBalance?.pendingPoints || 0);
      
      await this.pointsHistoryService.create({
        userId,
        transactionType: 'claim',
        pointsChange: pointsToClaim,
        pointsBalanceAfter,
        sourceType: 'claim',
        sourceId: claim.id,
        description: `Claimed ${pointsToClaim} ${earningRule.sourceType} points`,
        metadata: {
          claimId: claim.id,
          originalSourceId: earningRecord.sourceId,
          earningRuleId: earningRule.id
        }
      });

      return claim;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to claim points");
    }
  }

  /**
   * Claim all claimable points for a user
   * NOTE: With auto-award on delivery, this is mostly for retroactive/manual claims
   */
  public async claimAllClaimablePoints(userId: string): Promise<IPointsClaim[]> {
    try {
      // Get user's balance
      const balance = await this.userPointsBalanceService.getBalance(userId);
      
      if (!balance || balance.availablePoints === 0) {
        return []; // No points to process
      }

      // Find all earning transactions that haven't been claimed yet
      // This requires getting all 'earn' transactions and checking which ones have corresponding claims
      const allEarnings = await this.pointsHistoryService.findByUserId(userId);
      
      // Filter to only earning transactions that are claimable
      const claimableEarnings = allEarnings.filter(
        record => 
          (record.transactionType === 'earn' || record.transactionType === 'engagement') && 
          record.earningRuleId &&
          record.pointsChange > 0
      );

      // Get existing claims to avoid double-claiming
      const existingClaims = await this.pointsClaimRepository.findByUserId(userId);
      const claimedHistoryIds = new Set(
        existingClaims
          .filter(claim => claim.pointsHistoryId)
          .map(claim => claim.pointsHistoryId!)
      );

      // Filter out already claimed earnings
      const unclaimedEarnings = claimableEarnings.filter(
        record => !claimedHistoryIds.has(record.id)
      );

      if (unclaimedEarnings.length === 0) {
        return []; // All earnings already claimed
      }

      // Claim each earning
      const claims: IPointsClaim[] = [];
      
      for (const earning of unclaimedEarnings) {
        try {
          const claim = await this.claimPoints(userId, earning.id);
          claims.push(claim);
        } catch (error: any) {
          // Log error but continue with other claims
          console.error(`Failed to claim points from earning ${earning.id}:`, error.message);
        }
      }

      return claims;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to claim all points");
    }
  }

  /**
   * Get all claims for a user
   */
  public async getUserClaims(userId: string, limit = 50): Promise<IPointsClaim[]> {
    try {
      return await this.pointsClaimRepository.findByUserId(userId, limit);
    } catch (error: any) {
      throw new HttpException(500, error.message || "Failed to get user claims");
    }
  }

  /**
   * Get a specific claim by ID
   */
  public async getClaimById(claimId: string): Promise<IPointsClaim | null> {
    try {
      return await this.pointsClaimRepository.findById(claimId);
    } catch (error: any) {
      throw new HttpException(500, error.message || "Failed to get claim");
    }
  }

  /**
   * Get claim statistics for a user
   */
  public async getClaimStats(userId: string): Promise<{
    totalClaimed: number;
    totalExpired: number;
    activeClaims: number;
  }> {
    try {
      return await this.pointsClaimRepository.getUserClaimStats(userId);
    } catch (error: any) {
      throw new HttpException(500, error.message || "Failed to get claim stats");
    }
  }

  /**
   * Helper method to deduct available points
   * TODO: Move to UserPointsBalanceService
   */
  private async deductAvailablePoints(userId: string, points: number): Promise<void> {
    const UserPointsBalance = (await import("@/models/user-points-balance/userPointsBalance.model")).default;
    await UserPointsBalance.decrement({ availablePoints: points }, { where: { userId } });
    await UserPointsBalance.update({ lastTransactionAt: new Date() }, { where: { userId } });
  }

  /**
   * Helper method to increment available points
   * TODO: Use existing repository method
   */
  private async incrementAvailablePoints(userId: string, points: number): Promise<void> {
    const UserPointsBalance = (await import("@/models/user-points-balance/userPointsBalance.model")).default;
    await UserPointsBalance.increment({ availablePoints: points, lifetimeEarned: points }, { where: { userId } });
  }
}
