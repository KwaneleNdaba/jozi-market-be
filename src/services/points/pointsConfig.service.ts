import { Inject, Service } from "typedi";
import { POINTS_CONFIG_REPOSITORY_TOKEN, type IPointsConfigRepository } from "@/interfaces/points/IPointsConfigRepository.interface";
import { POINTS_CONFIG_SERVICE_TOKEN, type IPointsConfigService } from "@/interfaces/points/IPointsConfigService.interface";
import type { IPointsConfig, ICreatePointsConfig } from "@/types/points.types";
import { HttpException } from "@/exceptions/HttpException";
import User from "@/models/user/user.model";

@Service({ id: POINTS_CONFIG_SERVICE_TOKEN })
export class PointsConfigService implements IPointsConfigService {
  constructor(@Inject(POINTS_CONFIG_REPOSITORY_TOKEN) private readonly pointsConfigRepository: IPointsConfigRepository) {}

  public async create(data: ICreatePointsConfig): Promise<IPointsConfig> {
    try {
      // Validate user exists before creating config
      if (data.createdBy) {
        const userExists = await User.findByPk(data.createdBy);
        if (!userExists) {
          throw new HttpException(404, `User with ID ${data.createdBy} not found. Cannot create points config.`);
        }
        console.log('[PointsConfigService] User validated:', {
          id: userExists.id,
          email: userExists.email,
          role: userExists.role
        });
      }
      
      await this.validateConfigRules(data);
      
      const existingActive = await this.pointsConfigRepository.findActiveConfig();
      if (existingActive) {
        throw new HttpException(400, "An active configuration already exists. Please deactivate it first.");
      }

      return await this.pointsConfigRepository.create(data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to create points configuration");
    }
  }

  public async findById(id: string): Promise<IPointsConfig | null> {
    try {
      return await this.pointsConfigRepository.findById(id);
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find points configuration");
    }
  }

  public async findAll(): Promise<IPointsConfig[]> {
    try {
      return await this.pointsConfigRepository.findAll();
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to fetch points configurations");
    }
  }

  public async update(id: string, data: Partial<IPointsConfig>): Promise<IPointsConfig> {
    try {
      const existing = await this.pointsConfigRepository.findById(id);
      if (!existing) {
        throw new HttpException(404, "Points configuration not found");
      }

      await this.validateConfigRules(data);

      if (data.isActive && !existing.isActive) {
        const activeConfig = await this.pointsConfigRepository.findActiveConfig();
        if (activeConfig && activeConfig.id !== id) {
          throw new HttpException(400, "Another active configuration exists. Deactivate it first.");
        }
      }

      return await this.pointsConfigRepository.update(id, data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to update points configuration");
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const existing = await this.pointsConfigRepository.findById(id);
      if (!existing) {
        throw new HttpException(404, "Points configuration not found");
      }

      if (existing.isActive) {
        throw new HttpException(400, "Cannot delete an active configuration. Deactivate it first.");
      }

      await this.pointsConfigRepository.delete(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to delete points configuration");
    }
  }

  public async findActiveConfig(): Promise<IPointsConfig | null> {
    try {
      return await this.pointsConfigRepository.findActiveConfig();
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find active configuration");
    }
  }

  public async activateConfig(id: string): Promise<IPointsConfig> {
    try {
      const config = await this.pointsConfigRepository.findById(id);
      if (!config) {
        throw new HttpException(404, "Points configuration not found");
      }

      const activeConfig = await this.pointsConfigRepository.findActiveConfig();
      if (activeConfig && activeConfig.id !== id) {
        await this.pointsConfigRepository.deactivateConfig(activeConfig.id);
      }

      return await this.pointsConfigRepository.activateConfig(id, config.createdBy);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to activate configuration");
    }
  }

  public async deactivateConfig(id: string): Promise<IPointsConfig> {
    try {
      const config = await this.pointsConfigRepository.findById(id);
      if (!config) {
        throw new HttpException(404, "Points configuration not found");
      }

      return await this.pointsConfigRepository.deactivateConfig(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to deactivate configuration");
    }
  }

  public async findByVersion(version: number): Promise<IPointsConfig | null> {
    try {
      return await this.pointsConfigRepository.findByVersion(version);
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to find configuration by version");
    }
  }

  public async getConfigHistory(): Promise<IPointsConfig[]> {
    try {
      return await this.pointsConfigRepository.findAll();
    } catch (error) {
      throw new HttpException(500, error.message || "Failed to fetch configuration history");
    }
  }

  public async validateConfigRules(data: ICreatePointsConfig | Partial<IPointsConfig>): Promise<void> {
  }

  public async cloneConfig(id: string, createdBy: string): Promise<IPointsConfig> {
    try {
      const existing = await this.pointsConfigRepository.findById(id);
      if (!existing) {
        throw new HttpException(404, "Points configuration not found");
      }

      const latestVersion = await this.pointsConfigRepository.findAll();
      const maxVersion = Math.max(...latestVersion.map(c => c.version || 0), 0);

      const clonedData: ICreatePointsConfig = {
        pointsEnabled: existing.pointsEnabled,
        redemptionEnabled: existing.redemptionEnabled,
        allowStackWithDiscounts: existing.allowStackWithDiscounts,
        createdBy
      };

      return await this.pointsConfigRepository.create(clonedData);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || "Failed to clone configuration");
    }
  }
}
