import { Inject, Service } from "typedi";
import { ABUSE_FLAG_REPOSITORY_TOKEN, type IAbusFlagRepository } from "@/interfaces/points/IAbusFlagRepository.interface";
import { ABUSE_FLAG_SERVICE_TOKEN, type IAbusFlagService } from "@/interfaces/points/IAbusFlagService.interface";
import type { IAbuseFlag, ICreateAbuseFlag, FlagType, FlagStatus, FlagSeverity } from "@/types/points.types";
import { HttpException } from "@/exceptions/HttpException";

@Service({ id: ABUSE_FLAG_SERVICE_TOKEN })
export class AbusFlagService implements IAbusFlagService {
  constructor(@Inject(ABUSE_FLAG_REPOSITORY_TOKEN) private readonly abusFlagRepository: IAbusFlagRepository) {}

  public async create(data: ICreateAbuseFlag): Promise<IAbuseFlag> {
    try {
      await this.validateFlagDetails(data.flagType, data.flagDetails);
      return await this.abusFlagRepository.create(data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to create abuse flag");
    }
  }

  public async findById(id: string): Promise<IAbuseFlag | null> {
    try {
      return await this.abusFlagRepository.findById(id);
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find abuse flag");
    }
  }

  public async findAll(): Promise<IAbuseFlag[]> {
    try {
      return await this.abusFlagRepository.findAll();
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to fetch abuse flags");
    }
  }

  public async update(id: string, data: Partial<IAbuseFlag>): Promise<IAbuseFlag> {
    try {
      const existing = await this.abusFlagRepository.findById(id);
      if (!existing) {
        throw new HttpException(404, "Abuse flag not found");
      }

      if (data.flagType && data.flagDetails) {
        await this.validateFlagDetails(data.flagType, data.flagDetails);
      }

      return await this.abusFlagRepository.update(id, data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to update abuse flag");
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const existing = await this.abusFlagRepository.findById(id);
      if (!existing) {
        throw new HttpException(404, "Abuse flag not found");
      }

      await this.abusFlagRepository.delete(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to delete abuse flag");
    }
  }

  public async findByUserId(userId: string): Promise<IAbuseFlag[]> {
    try {
      return await this.abusFlagRepository.findByUserId(userId);
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find flags by user");
    }
  }

  public async findByFlagType(flagType: FlagType): Promise<IAbuseFlag[]> {
    try {
      return await this.abusFlagRepository.findByFlagType(flagType);
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find flags by type");
    }
  }

  public async findByStatus(status: FlagStatus): Promise<IAbuseFlag[]> {
    try {
      return await this.abusFlagRepository.findByStatus(status);
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find flags by status");
    }
  }

  public async findBySeverity(severity: FlagSeverity): Promise<IAbuseFlag[]> {
    try {
      return await this.abusFlagRepository.findBySeverity(severity);
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find flags by severity");
    }
  }

  public async findPendingFlags(): Promise<IAbuseFlag[]> {
    try {
      return await this.abusFlagRepository.findPendingFlags();
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find pending flags");
    }
  }

  public async findActiveFlagsForUser(userId: string): Promise<IAbuseFlag[]> {
    try {
      const userFlags = await this.abusFlagRepository.findByUserId(userId);
      return userFlags.filter(flag => flag.status === "pending" || flag.status === "under_review");
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find active flags for user");
    }
  }

  public async validateFlagDetails(flagType: FlagType, flagDetails: any): Promise<void> {
    if (!flagType) {
      throw new HttpException(400, "Flag type is required");
    }

    if (!flagDetails || typeof flagDetails !== "object") {
      throw new HttpException(400, "Flag details must be a valid object");
    }
  }

  public async reviewFlag(id: string, reviewedBy: string, reviewNotes: string, actionTaken?: string): Promise<IAbuseFlag> {
    try {
      const flag = await this.abusFlagRepository.findById(id);
      if (!flag) {
        throw new HttpException(404, "Abuse flag not found");
      }

      if (flag.status !== "pending") {
        throw new HttpException(400, "Only pending flags can be reviewed");
      }

      return await this.abusFlagRepository.update(id, {
        status: "under_review",
        reviewedBy,
        reviewNotes,
        actionTaken: actionTaken || null,
        reviewedAt: new Date()
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to review flag");
    }
  }

  public async resolveFlag(id: string, isValid: boolean, reviewedBy: string, reviewNotes: string): Promise<IAbuseFlag> {
    try {
      const flag = await this.abusFlagRepository.findById(id);
      if (!flag) {
        throw new HttpException(404, "Abuse flag not found");
      }

      const status: FlagStatus = isValid ? "resolved_valid" : "resolved_invalid";
      const actionTaken = isValid ? "Flag confirmed and action taken" : "Flag marked as false positive";

      return await this.abusFlagRepository.resolveFlag(id, reviewedBy, actionTaken, reviewNotes);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to resolve flag");
    }
  }

  public async dismissFlag(id: string, reviewedBy: string, reviewNotes: string): Promise<IAbuseFlag> {
    try {
      const flag = await this.abusFlagRepository.findById(id);
      if (!flag) {
        throw new HttpException(404, "Abuse flag not found");
      }

      return await this.abusFlagRepository.update(id, {
        status: "dismissed",
        reviewedBy,
        reviewNotes,
        actionTaken: "Flag dismissed",
        reviewedAt: new Date()
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to dismiss flag");
    }
  }

  public async updateStatus(id: string, status: FlagStatus): Promise<IAbuseFlag> {
    try {
      const flag = await this.abusFlagRepository.findById(id);
      if (!flag) {
        throw new HttpException(404, "Abuse flag not found");
      }

      return await this.abusFlagRepository.update(id, { status });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to update flag status");
    }
  }

  public async findByIpAddress(ipAddress: string): Promise<IAbuseFlag[]> {
    try {
      const allFlags = await this.abusFlagRepository.findAll();
      return allFlags.filter(flag => {
        const details = flag.flagDetails as any;
        return details?.ipAddress === ipAddress;
      });
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find flags by IP address");
    }
  }

  public async findByDeviceFingerprint(deviceFingerprint: string): Promise<IAbuseFlag[]> {
    try {
      const allFlags = await this.abusFlagRepository.findAll();
      return allFlags.filter(flag => {
        const details = flag.flagDetails as any;
        return details?.deviceFingerprint === deviceFingerprint;
      });
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find flags by device fingerprint");
    }
  }
}
