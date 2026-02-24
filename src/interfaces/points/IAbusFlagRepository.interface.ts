import { Token } from "typedi";
import type { IAbuseFlag, ICreateAbuseFlag, FlagType, FlagStatus, FlagSeverity } from "@/types/points.types";

export interface IAbusFlagRepository {
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
  resolveFlag(id: string, reviewedBy: string, actionTaken: string, reviewNotes?: string): Promise<IAbuseFlag>;
}

export const ABUSE_FLAG_REPOSITORY_TOKEN = new Token<IAbusFlagRepository>("IAbusFlagRepository");
