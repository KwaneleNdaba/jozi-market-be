import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import {
  POINTS_CLAIM_SERVICE_TOKEN,
  type IPointsClaimService,
} from "@/interfaces/points-claim/IPointsClaimService.interface";
import type { CustomResponse } from "@/types/response.interface";
import type { IPointsClaim } from "@/interfaces/points-claim/IPointsClaim.interface";

export class PointsClaimController {
  public service: IPointsClaimService;

  constructor() {
    this.service = Container.get(POINTS_CLAIM_SERVICE_TOKEN);
  }

  /**
   * Claim specific points
   * POST /api/points-claim/claim
   * Body: { pointsHistoryId: string }
   */
  public claimPoints = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { pointsHistoryId } = req.body;

      if (!userId) {
        res.status(401).json({
          data: null,
          message: "Unauthorized",
          error: true,
        });
        return;
      }

      if (!pointsHistoryId) {
        res.status(400).json({
          data: null,
          message: "pointsHistoryId is required",
          error: true,
        });
        return;
      }

      const claim = await this.service.claimPoints(userId, pointsHistoryId);

      const response: CustomResponse<IPointsClaim> = {
        data: claim,
        message: "Points claimed successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Claim all claimable points
   * POST /api/points-claim/claim-all
   */
  public claimAllPoints = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          data: null,
          message: "Unauthorized",
          error: true,
        });
        return;
      }

      const claims = await this.service.claimAllClaimablePoints(userId);

      const response: CustomResponse<IPointsClaim[]> = {
        data: claims,
        message: claims.length > 0 
          ? `Successfully claimed ${claims.length} point transaction(s)`
          : "No points available to claim",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user's claims history
   * GET /api/points-claim/user/:userId
   */
  public getUserClaims = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      const claims = await this.service.getUserClaims(userId, limit);

      const response: CustomResponse<IPointsClaim[]> = {
        data: claims,
        message: "User claims retrieved successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get specific claim by ID
   * GET /api/points-claim/:claimId
   */
  public getClaimById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { claimId } = req.params;

      const claim = await this.service.getClaimById(claimId);

      if (!claim) {
        res.status(404).json({
          data: null,
          message: "Claim not found",
          error: true,
        });
        return;
      }

      const response: CustomResponse<IPointsClaim> = {
        data: claim,
        message: "Claim retrieved successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get claim statistics for a user
   * GET /api/points-claim/user/:userId/stats
   */
  public getClaimStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;

      const stats = await this.service.getClaimStats(userId);

      const response: CustomResponse<{
        totalClaimed: number;
        totalExpired: number;
        activeClaims: number;
      }> = {
        data: stats,
        message: "Claim statistics retrieved successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
