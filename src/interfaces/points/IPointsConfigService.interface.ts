import { Token } from "typedi";
import type { IPointsConfig, ICreatePointsConfig } from "@/types/points.types";

export interface IPointsConfigService {
  create(data: ICreatePointsConfig): Promise<IPointsConfig>;
  findById(id: string): Promise<IPointsConfig | null>;
  findAll(): Promise<IPointsConfig[]>;
  update(id: string, data: Partial<IPointsConfig>): Promise<IPointsConfig>;
  delete(id: string): Promise<void>;
  
  findActiveConfig(): Promise<IPointsConfig | null>;
  activateConfig(id: string): Promise<IPointsConfig>;
  deactivateConfig(id: string): Promise<IPointsConfig>;
  findByVersion(version: number): Promise<IPointsConfig | null>;
  getConfigHistory(): Promise<IPointsConfig[]>;
  validateConfigRules(data: ICreatePointsConfig | Partial<IPointsConfig>): Promise<void>;
  cloneConfig(id: string, createdBy: string): Promise<IPointsConfig>;
}

export const POINTS_CONFIG_SERVICE_TOKEN = new Token<IPointsConfigService>("IPointsConfigService");
