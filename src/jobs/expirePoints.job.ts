import { Container } from "typedi";
import { CronJob } from "cron";
import { Op } from "sequelize";
import PointsClaim from "@/models/points-claim/pointsClaim.model";
import PointsHistory from "@/models/points-history/pointsHistory.model";
import UserPointsBalance from "@/models/user-points-balance/userPointsBalance.model";
import { logger } from "@/utils/logger";

/**
 * Cron Job to automatically expire claimed points
 * Runs daily at 2:00 AM
 * 
 * This job checks the PointsClaim table for expired claims and deducts
 * the points from user balances based on when they were earned + expiryDays
 */
export class ExpirePointsJob {
  private job: CronJob;

  constructor() {
    // Run daily at 2:00 AM
    this.job = new CronJob(
      "0 2 * * *", // cron pattern: minute hour day month dayOfWeek
      this.expirePoints.bind(this),
      null, // onComplete
      false, // start now
      "Africa/Johannesburg" // timezone
    );
  }

  /**
   * Main function to find and expire claimed points
   */
  private async expirePoints(): Promise<void> {
    const now = new Date();
    logger.info(`[ExpirePointsJob] Starting points expiration check at ${now.toISOString()}`);

    try {
      // Find all claimed points that have expired (expiresAt has passed and not yet marked as expired)
      const expiredClaims = await PointsClaim.findAll({
        where: {
          expiresAt: {
            [Op.lte]: now,
          },
          isExpired: false,
          expiredAt: null,
        },
        raw: false,
      });

      if (expiredClaims.length === 0) {
        logger.info("[ExpirePointsJob] No points to expire");
        return;
      }

      logger.info(`[ExpirePointsJob] Found ${expiredClaims.length} claim records to expire`);

      // Group by user to process user balances
      const userPointsMap = new Map<string, { points: number; claimIds: string[] }>();

      for (const claim of expiredClaims) {
        const userId = claim.userId;
        const points = claim.pointsClaimed;
        const claimId = claim.id;

        if (userPointsMap.has(userId)) {
          const data = userPointsMap.get(userId)!;
          data.points += points;
          data.claimIds.push(claimId);
        } else {
          userPointsMap.set(userId, { points, claimIds: [claimId] });
        }

        // Mark claim as expired
        await claim.update({ 
          isExpired: true, 
          expiredAt: now 
        });
      }

      // Process each user
      let successCount = 0;
      let errorCount = 0;

      for (const [userId, data] of userPointsMap.entries()) {
        try {
          await this.expireUserPoints(userId, data.points, data.claimIds);
          successCount++;
        } catch (error: any) {
          logger.error(`[ExpirePointsJob] Failed to expire ${data.points} points for user ${userId}:`, error);
          errorCount++;
        }
      }

      logger.info(
        `[ExpirePointsJob] Completed: ${successCount} users processed, ${errorCount} errors`
      );
    } catch (error: any) {
      logger.error("[ExpirePointsJob] Fatal error during points expiration:", error);
    }
  }

  /**
   * Expire points for a specific user
   * Points are only deducted from availablePoints since only claimed points can expire
   */
  private async expireUserPoints(userId: string, pointsToExpire: number, claimIds: string[]): Promise<void> {
    try {
      // Get current balance
      const balance = await UserPointsBalance.findOne({
        where: { userId },
        raw: false,
      });

      if (!balance) {
        logger.warn(`[ExpirePointsJob] User ${userId} has no points balance record`);
        return;
      }

      // Deduct from available points (claimed points are in availablePoints)
      const deduction = Math.min(pointsToExpire, balance.availablePoints);
      
      if (deduction < pointsToExpire) {
        logger.warn(
          `[ExpirePointsJob] User ${userId} should expire ${pointsToExpire} points but only has ${balance.availablePoints} available`
        );
      }

      // Update balance
      await balance.update({
        availablePoints: balance.availablePoints - deduction,
        lastTransactionAt: new Date(),
      });

      const newBalance = balance.availablePoints - deduction;

      // Record expiry transaction
      await PointsHistory.create({
        userId,
        transactionType: "expire",
        pointsChange: -deduction,
        pointsBalanceAfter: newBalance,
        sourceType: "expiry",
        description: `${deduction} points expired from ${claimIds.length} claim(s)`,
        metadata: {
          expiredClaims: claimIds,
          totalExpired: deduction,
        },
        adminAdjusted: false,
      } as any);

      logger.info(
        `[ExpirePointsJob] Expired ${deduction} points for user ${userId} from ${claimIds.length} claim(s)`
      );

      // TODO: Send notification to user about expired points
      // await sendExpiryNotification(userId, deduction, claimIds);
    } catch (error: any) {
      throw new Error(`Failed to expire points for user ${userId}: ${error.message}`);
    }
  }

  /**
   * Start the cron job
   */
  public start(): void {
    this.job.start();
    logger.info("[ExpirePointsJob] Points expiry cron job started (runs daily at 2:00 AM)");
  }

  /**
   * Stop the cron job
   */
  public stop(): void {
    this.job.stop();
    logger.info("[ExpirePointsJob] Points expiry cron job stopped");
  }

  /**
   * Manually trigger expiry (for testing)
   */
  public async runNow(): Promise<void> {
    logger.info("[ExpirePointsJob] Manually triggering points expiry");
    await this.expirePoints();
  }
}

// Export singleton instance
export const expirePointsJob = new ExpirePointsJob();
