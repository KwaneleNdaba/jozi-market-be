import { Inject, Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { type ICategoryAttributeRepository, CATEGORY_ATTRIBUTE_REPOSITORY_TOKEN } from "@/interfaces/category-attribute/ICategoryAttributeRepository.interface";
import { type ICategoryAttributeService, CATEGORY_ATTRIBUTE_SERVICE_TOKEN } from "@/interfaces/category-attribute/ICategoryAttributeService.interface";
import type { ICategoryAttribute, ICreateCategoryAttribute, IUpdateCategoryAttribute } from "@/types/attribute.types";

@Service({ id: CATEGORY_ATTRIBUTE_SERVICE_TOKEN })
export class CategoryAttributeService implements ICategoryAttributeService {
  constructor(@Inject(CATEGORY_ATTRIBUTE_REPOSITORY_TOKEN) private readonly categoryAttributeRepository: ICategoryAttributeRepository) {}

  public async createCategoryAttribute(categoryAttributeData: ICreateCategoryAttribute): Promise<ICategoryAttribute> {
    try {
      return await this.categoryAttributeRepository.create(categoryAttributeData);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async getCategoryAttributeById(id: string): Promise<ICategoryAttribute | null> {
    try {
      return await this.categoryAttributeRepository.findById(id);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getCategoryAttributesByCategoryId(categoryId: string): Promise<ICategoryAttribute[]> {
    try {
      return await this.categoryAttributeRepository.findByCategoryId(categoryId);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getAllCategoryAttributes(): Promise<ICategoryAttribute[]> {
    try {
      return await this.categoryAttributeRepository.findAll();
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async updateCategoryAttribute(updateData: IUpdateCategoryAttribute): Promise<ICategoryAttribute> {
    try {
      const categoryAttribute = await this.categoryAttributeRepository.findById(updateData.id);
      if (!categoryAttribute) {
        throw new HttpException(404, "Category attribute not found");
      }

      return await this.categoryAttributeRepository.update(updateData);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async deleteCategoryAttribute(id: string): Promise<void> {
    try {
      const categoryAttribute = await this.categoryAttributeRepository.findById(id);
      if (!categoryAttribute) {
        throw new HttpException(404, "Category attribute not found");
      }

      await this.categoryAttributeRepository.delete(id);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }
}
