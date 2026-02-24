import { Inject, Service } from "typedi";
import { POINTS_HISTORY_REPOSITORY_TOKEN, type IPointsHistoryRepository } from "@/interfaces/points/IPointsHistoryRepository.interface";
import { POINTS_HISTORY_SERVICE_TOKEN, type IPointsHistoryService } from "@/interfaces/points/IPointsHistoryService.interface";
import type { IPointsHistory, ICreatePointsHistory } from "@/types/points.types";
import { HttpException } from "@/exceptions/HttpException";

@Service({ id: POINTS_HISTORY_SERVICE_TOKEN })
export class PointsHistoryService implements IPointsHistoryService {
  constructor(@Inject(POINTS_HISTORY_REPOSITORY_TOKEN) private readonly pointsHistoryRepository: IPointsHistoryRepository) {}

  public async create(data: ICreatePointsHistory): Promise<IPointsHistory> {
    try {
      return await this.pointsHistoryRepository.create(data);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to create points history record");
    }
  }

  public async findById(id: string): Promise<IPointsHistory | null> {
    try {
      return await this.pointsHistoryRepository.findById(id);
    } catch (error: any) {
      throw new HttpException(500, error.message || "Failed to find points history record");
    }
  }

  public async findAll(): Promise<IPointsHistory[]> {
    try {
      return await this.pointsHistoryRepository.findAll();
    } catch (error: any) {
      throw new HttpException(500, error.message || "Failed to fetch points history records");
    }
  }

  public async findByUserId(userId: string): Promise<IPointsHistory[]> {
    try {
      return await this.pointsHistoryRepository.findByUserId(userId);
    } catch (error: any) {
      throw new HttpException(500, error.message || "Failed to fetch points history for user");
    }
  }

  public async findBySourceId(sourceId: string): Promise<IPointsHistory[]> {
    try {
      return await this.pointsHistoryRepository.findBySourceId(sourceId);
    } catch (error: any) {
      throw new HttpException(500, error.message || "Failed to fetch points history for source");
    }
  }
}
