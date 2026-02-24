import { Inject, Service } from "typedi";
import { TIER_REPOSITORY_TOKEN, type ITierRepository } from "@/interfaces/points/ITierRepository.interface";
import { TIER_SERVICE_TOKEN, type ITierService } from "@/interfaces/points/ITierService.interface";
import type { ITier, ICreateTier } from "@/types/points.types";
import { HttpException } from "@/exceptions/HttpException";

@Service({ id: TIER_SERVICE_TOKEN })
export class TierService implements ITierService {
  constructor(@Inject(TIER_REPOSITORY_TOKEN) private readonly tierRepository: ITierRepository) {}

  public async create(data: ICreateTier): Promise<ITier> {
    try {
      await this.validateTierHierarchy(data);
      return await this.tierRepository.create(data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to create tier");
    }
  }

  public async findById(id: string): Promise<ITier | null> {
    try {
      return await this.tierRepository.findById(id);
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find tier");
    }
  }

  public async findAll(): Promise<ITier[]> {
    try {
      return await this.tierRepository.findAll();
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to fetch tiers");
    }
  }

  public async update(id: string, data: Partial<ITier>): Promise<ITier> {
    try {
      const existing = await this.tierRepository.findById(id);
      if (!existing) {
        throw new HttpException(404, "Tier not found");
      }

      if (data.tierLevel || data.minPoints) {
        await this.validateTierHierarchy(data);
      }

      return await this.tierRepository.update(id, data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to update tier");
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const existing = await this.tierRepository.findById(id);
      if (!existing) {
        throw new HttpException(404, "Tier not found");
      }

      await this.tierRepository.delete(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to delete tier");
    }
  }

  public async findActiveTiers(): Promise<ITier[]> {
    try {
      return await this.tierRepository.findActiveTiers();
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find active tiers");
    }
  }

  public async findByLevel(tierLevel: number): Promise<ITier | null> {
    try {
      return await this.tierRepository.findByTierLevel(tierLevel);
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find tier by level");
    }
  }

  public async findTierByPoints(points: number): Promise<ITier | null> {
    try {
      return await this.tierRepository.findTierForPoints(points);
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find tier by points");
    }
  }

  public async validateTierHierarchy(data: ICreateTier | Partial<ITier>): Promise<void> {
    if (data.minPoints !== undefined && data.minPoints < 0) {
      throw new HttpException(400, "Minimum points cannot be negative");
    }

    if (data.tierLevel !== undefined && data.tierLevel < 0) {
      throw new HttpException(400, "Tier level cannot be negative");
    }

    if (data.name && data.name.trim().length === 0) {
      throw new HttpException(400, "Tier name cannot be empty");
    }
  }

  public async activateTier(id: string): Promise<ITier> {
    try {
      const tier = await this.tierRepository.findById(id);
      if (!tier) {
        throw new HttpException(404, "Tier not found");
      }

      return await this.tierRepository.update(id, { active: true });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to activate tier");
    }
  }

  public async deactivateTier(id: string): Promise<ITier> {
    try {
      const tier = await this.tierRepository.findById(id);
      if (!tier) {
        throw new HttpException(404, "Tier not found");
      }

      return await this.tierRepository.update(id, { active: false });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to deactivate tier");
    }
  }

  public async reorderTiers(tierIds: string[]): Promise<ITier[]> {
    try {
      const allTiers = await this.tierRepository.findAll();
      
      if (allTiers.length !== tierIds.length) {
        throw new HttpException(400, "All tiers must be included in reorder");
      }

      const updatedTiers: ITier[] = [];
      for (let i = 0; i < tierIds.length; i++) {
        const tier = allTiers.find(t => t.id === tierIds[i]);
        if (!tier) {
          throw new HttpException(404, `Tier ${tierIds[i]} not found`);
        }
        const updated = await this.tierRepository.update(tierIds[i], { tierLevel: i });
        updatedTiers.push(updated);
      }

      return updatedTiers;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to reorder tiers");
    }
  }
}
