import type { Request, Response, NextFunction } from "express";
import Container from "typedi";
import {
  CAMPAIGN_CLAIM_SERVICE_TOKEN,
  type ICampaignClaimService,
} from "@/interfaces/campaign-claim/ICampaignClaimService.interface";

export class CampaignClaimController {
  private get service(): ICampaignClaimService {
    return Container.get(CAMPAIGN_CLAIM_SERVICE_TOKEN);
  }

  // POST /campaign-claims  — authenticated user claims a campaign
  public claim = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }
      const { campaignId } = req.body;
      if (!campaignId) { res.status(400).json({ message: "campaignId is required" }); return; }
      const claim = await this.service.claim(userId, campaignId);
      res.status(201).json({ data: claim, message: "Campaign claimed successfully" });
    } catch (error) {
      next(error);
    }
  };

  // GET /campaign-claims/my  — authenticated user's own claims
  public getMyClaims = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }
      const claims = await this.service.findByUserId(userId);
      res.status(200).json({ data: claims });
    } catch (error) {
      next(error);
    }
  };

  // GET /campaign-claims  — admin: all claims
  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const claims = await this.service.findAll();
      res.status(200).json({ data: claims });
    } catch (error) {
      next(error);
    }
  };

  // GET /campaign-claims/:id
  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const claim = await this.service.findById(req.params.id);
      if (!claim) { res.status(404).json({ message: "Claim not found" }); return; }
      res.status(200).json({ data: claim });
    } catch (error) {
      next(error);
    }
  };

  // GET /campaign-claims/campaign/:campaignId  — all claims for a campaign
  public getByCampaignId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const claims = await this.service.findByCampaignId(req.params.campaignId);
      res.status(200).json({ data: claims });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /campaign-claims/:id/fulfill  — vendor/admin marks claim as fulfilled
  public fulfill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const claim = await this.service.fulfill(req.params.id);
      res.status(200).json({ data: claim, message: "Claim fulfilled" });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /campaign-claims/:id/cancel  — user cancels their own pending claim
  public cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }
      const claim = await this.service.cancel(req.params.id, userId);
      res.status(200).json({ data: claim, message: "Claim cancelled and points refunded" });
    } catch (error) {
      next(error);
    }
  };
}
