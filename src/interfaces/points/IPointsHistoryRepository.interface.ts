import { Token } from "typedi";
import type { IPointsHistory, ICreatePointsHistory } from "@/types/points.types";

export interface IPointsHistoryRepository {
  create(data: ICreatePointsHistory): Promise<IPointsHistory>;
  findById(id: string): Promise<IPointsHistory | null>;
  findAll(): Promise<IPointsHistory[]>;
  findByUserId(userId: string): Promise<IPointsHistory[]>;
  findByTransactionType(transactionType: string): Promise<IPointsHistory[]>;
  findBySourceId(sourceId: string): Promise<IPointsHistory[]>;
  findByEarningRule(earningRuleId: string): Promise<IPointsHistory[]>;
}

export const POINTS_HISTORY_REPOSITORY_TOKEN = new Token<IPointsHistoryRepository>("IPointsHistoryRepository");
