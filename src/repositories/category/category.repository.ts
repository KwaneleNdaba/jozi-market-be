import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  type ICategoryRepository,
  CATEGORY_REPOSITORY_TOKEN,
} from "@/interfaces/category/ICategoryRepository.interface";
import Category from "@/models/category/category.model";
import type { ICategory, ICreateCategory, IUpdateCategory } from "@/types/category.types";

@Service({ id: CATEGORY_REPOSITORY_TOKEN })
export class CategoryRepository implements ICategoryRepository {
  public async create(categoryData: Omit<ICreateCategory, "subcategories">): Promise<ICategory> {
    try {
      const createdCategory = await Category.create(categoryData as any, {
        raw: false,
      });

      return createdCategory.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<ICategory | null> {
    try {
      const category = await Category.findByPk(id, { raw: true });
      return category;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByCategoryId(categoryId: string | null): Promise<ICategory[]> {
    try {
      const categories = await Category.findAll({
        where: { categoryId },
        raw: true,
        order: [["createdAt", "ASC"]],
      });
      return categories;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(status?: string): Promise<ICategory[]> {
    try {
      const where: any = {};
      if (status) {
        where.status = status;
      }

      const categories = await Category.findAll({
        where,
        raw: true,
        order: [["createdAt", "ASC"]],
      });

      return categories;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAllWithSubcategories(status?: string): Promise<ICategory[]> {
    try {
      const where: any = {};
      if (status) {
        where.status = status;
      }

      // Get all categories
      const allCategories = await Category.findAll({
        where,
        raw: true,
        order: [["createdAt", "ASC"]],
      });

      // Separate top-level categories (categoryId is null) from subcategories
      const topLevelCategories = allCategories.filter((cat) => cat.categoryId === null);
      const subcategories = allCategories.filter((cat) => cat.categoryId !== null);

      // Group subcategories by their parent categoryId
      const subcategoriesByParent = subcategories.reduce((acc, subcategory) => {
        const parentId = subcategory.categoryId!;
        if (!acc[parentId]) {
          acc[parentId] = [];
        }
        acc[parentId].push(subcategory);
        return acc;
      }, {} as Record<string, ICategory[]>);

      // Attach subcategories to their parent categories
      const categoriesWithSubcategories = topLevelCategories.map((category) => ({
        ...category,
        subcategories: subcategoriesByParent[category.id!] || [],
      }));

      return categoriesWithSubcategories;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async update(updateData: IUpdateCategory): Promise<ICategory> {
    try {
      const category = await Category.findOne({
        where: { id: updateData.id },
        raw: false,
      });

      if (!category) {
        throw new HttpException(404, "Category not found");
      }

      const updatePayload: any = {};
      if (updateData.name !== undefined) updatePayload.name = updateData.name;
      if (updateData.description !== undefined) updatePayload.description = updateData.description;
      if (updateData.status !== undefined) updatePayload.status = updateData.status;
      if (updateData.icon !== undefined) updatePayload.icon = updateData.icon;
      if (updateData.categoryId !== undefined) updatePayload.categoryId = updateData.categoryId;

      await category.update(updatePayload);

      return category.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const category = await Category.findOne({
        where: { id },
      });

      if (!category) {
        throw new HttpException(404, "Category not found");
      }

      await category.destroy();
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }
}
