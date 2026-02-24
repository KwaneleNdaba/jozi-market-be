import { Token } from "typedi";
import type { IPointsHistory, ICreatePointsHistory } from "@/types/points.types";

export interface IPointsHistoryService {
  create(data: ICreatePointsHistory): Promise<IPointsHistory>;
  findById(id: string): Promise<IPointsHistory | null>;
  findAll(): Promise<IPointsHistory[]>;
  findByUserId(userId: string): Promise<IPointsHistory[]>;
  findBySourceId(sourceId: string): Promise<IPointsHistory[]>;
}

export const POINTS_HISTORY_SERVICE_TOKEN = new Token<IPointsHistoryService>("IPointsHistoryService");
