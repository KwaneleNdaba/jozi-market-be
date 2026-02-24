import { Token } from "typedi";
import type { IAbuseFlag, ICreateAbuseFlag, FlagType, FlagStatus, FlagSeverity } from "@/types/points.types";

export interface IAbusFlagService {
  create(data: ICreateAbuseFlag): Promise<IAbuseFlag>;
  findById(id: string): Promise<IAbuseFlag | null>;
  findAll(): Promise<IAbuseFlag[]>;
  update(id: string, data: Partial<IAbuseFlag>): Promise<IAbuseFlag>;
  delete(id: string): Promise<void>;
  
  findByUserId(userId: string): Promise<IAbuseFlag[]>;
  findByFlagType(flagType: FlagType): Promise<IAbuseFlag[]>;
  findByStatus(status: FlagStatus): Promise<IAbuseFlag[]>;
  findBySeverity(severity: FlagSeverity): Promise<IAbuseFlag[]>;
  findPendingFlags(): Promise<IAbuseFlag[]>;
  findActiveFlagsForUser(userId: string): Promise<IAbuseFlag[]>;
  validateFlagDetails(flagType: FlagType, flagDetails: any): Promise<void>;
  reviewFlag(id: string, reviewedBy: string, reviewNotes: string, actionTaken?: string): Promise<IAbuseFlag>;
  resolveFlag(id: string, isValid: boolean, reviewedBy: string, reviewNotes: string): Promise<IAbuseFlag>;
  dismissFlag(id: string, reviewedBy: string, reviewNotes: string): Promise<IAbuseFlag>;
  updateStatus(id: string, status: FlagStatus): Promise<IAbuseFlag>;
  findByIpAddress(ipAddress: string): Promise<IAbuseFlag[]>;
  findByDeviceFingerprint(deviceFingerprint: string): Promise<IAbuseFlag[]>;
}

export const ABUSE_FLAG_SERVICE_TOKEN = new Token<IAbusFlagService>("IAbusFlagService");
