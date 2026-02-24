import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  ABUSE_FLAG_REPOSITORY_TOKEN,
  type IAbusFlagRepository,
} from "@/interfaces/points/IAbusFlagRepository.interface";
import AbuseFlag from "@/models/abuse-flag/abuseFlag.model";
import type { IAbuseFlag, ICreateAbuseFlag, FlagType, FlagStatus, FlagSeverity } from "@/types/points.types";

@Service({ id: ABUSE_FLAG_REPOSITORY_TOKEN })
export class AbusFlagRepository implements IAbusFlagRepository {
  public async create(data: ICreateAbuseFlag): Promise<IAbuseFlag> {
    try {
      const flag = await AbuseFlag.create(data as any, { raw: false });
      return flag.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<IAbuseFlag | null> {
    try {
      return (await AbuseFlag.findOne({
        where: { id },
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(): Promise<IAbuseFlag[]> {
    try {
      return (await AbuseFlag.findAll({
        order: [["createdAt", "DESC"]],
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async update(id: string, data: Partial<IAbuseFlag>): Promise<IAbuseFlag> {
    try {
      const flag = await AbuseFlag.findOne({
        where: { id },
        raw: false,
      });

      if (!flag) {
        throw new HttpException(404, "AbuseFlag not found");
      }

      await flag.update(data);
      return flag.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const flag = await AbuseFlag.findOne({
        where: { id },
      });

      if (!flag) {
        throw new HttpException(404, "AbuseFlag not found");
      }

      await flag.destroy();
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async findByUserId(userId: string): Promise<IAbuseFlag[]> {
    try {
      return (await AbuseFlag.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByFlagType(flagType: FlagType): Promise<IAbuseFlag[]> {
    try {
      return (await AbuseFlag.findAll({
        where: { flagType },
        order: [["createdAt", "DESC"]],
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByStatus(status: FlagStatus): Promise<IAbuseFlag[]> {
    try {
      return (await AbuseFlag.findAll({
        where: { status },
        order: [["createdAt", "DESC"]],
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findBySeverity(severity: FlagSeverity): Promise<IAbuseFlag[]> {
    try {
      return (await AbuseFlag.findAll({
        where: { severity },
        order: [["createdAt", "DESC"]],
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findPendingFlags(): Promise<IAbuseFlag[]> {
    try {
      return (await AbuseFlag.findAll({
        where: { status: "PENDING" },
        order: [["createdAt", "ASC"]],
        raw: true,
      })) as any;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async resolveFlag(
    id: string,
    reviewedBy: string,
    actionTaken: string,
    reviewNotes?: string
  ): Promise<IAbuseFlag> {
    try {
      const flag = await AbuseFlag.findOne({
        where: { id },
        raw: false,
      });

      if (!flag) {
        throw new HttpException(404, "AbuseFlag not found");
      }

      await flag.update({
        status: "RESOLVED",
        reviewedBy,
        reviewedAt: new Date(),
        actionTaken,
        reviewNotes,
      });

      return flag.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }
}
