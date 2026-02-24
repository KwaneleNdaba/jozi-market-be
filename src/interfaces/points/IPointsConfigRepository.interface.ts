import { Token } from "typedi";
import type { IPointsConfig, ICreatePointsConfig } from "@/types/points.types";

export interface IPointsConfigRepository {
  create(data: ICreatePointsConfig): Promise<IPointsConfig>;
  findById(id: string): Promise<IPointsConfig | null>;
  findAll(): Promise<IPointsConfig[]>;
  update(id: string, data: Partial<IPointsConfig>): Promise<IPointsConfig>;
  delete(id: string): Promise<void>;
  findActiveConfig(): Promise<IPointsConfig | null>;
  findByVersion(version: number): Promise<IPointsConfig | null>;
  activateConfig(id: string, userId: string): Promise<IPointsConfig>;
  deactivateConfig(id: string): Promise<IPointsConfig>;
}

export const POINTS_CONFIG_REPOSITORY_TOKEN = new Token<IPointsConfigRepository>("IPointsConfigRepository");
