import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  POINTS_HISTORY_REPOSITORY_TOKEN,
  type IPointsHistoryRepository,
} from "@/interfaces/points/IPointsHistoryRepository.interface";
import PointsHistory from "@/models/points-history/pointsHistory.model";
import type { IPointsHistory, ICreatePointsHistory } from "@/types/points.types";

@Service({ id: POINTS_HISTORY_REPOSITORY_TOKEN })
export class PointsHistoryRepository implements IPointsHistoryRepository {
  public async create(data: ICreatePointsHistory): Promise<IPointsHistory> {
    try {
      const record = await PointsHistory.create(data as any, { raw: false });
      return record.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<IPointsHistory | null> {
    try {
      return (await PointsHistory.findOne({ where: { id }, raw: true })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(): Promise<IPointsHistory[]> {
    try {
      return (await PointsHistory.findAll({ order: [["createdAt", "DESC"]], raw: true })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByUserId(userId: string): Promise<IPointsHistory[]> {
    try {
      return (await PointsHistory.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByTransactionType(transactionType: string): Promise<IPointsHistory[]> {
    try {
      return (await PointsHistory.findAll({
        where: { transactionType },
        order: [["createdAt", "DESC"]],
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findBySourceId(sourceId: string): Promise<IPointsHistory[]> {
    try {
      return (await PointsHistory.findAll({
        where: { sourceId },
        order: [["createdAt", "DESC"]],
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByEarningRule(earningRuleId: string): Promise<IPointsHistory[]> {
    try {
      return (await PointsHistory.findAll({
        where: { earningRuleId },
        order: [["createdAt", "DESC"]],
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }
}
