import { Token } from "typedi";
import type { ICategory, ICreateCategory, IUpdateCategory } from "@/types/category.types";

export interface ICategoryService {
  createCategory(categoryData: ICreateCategory): Promise<ICategory>;
  getCategoryById(id: string): Promise<ICategory | null>;
  getSubcategoriesByCategoryId(categoryId: string): Promise<ICategory[]>;
  getAllCategories(status?: string): Promise<ICategory[]>;
  updateCategory(updateData: IUpdateCategory): Promise<ICategory>;
  deleteCategory(id: string): Promise<void>;
}

export const CATEGORY_SERVICE_TOKEN = new Token<ICategoryService>("ICategoryService");
