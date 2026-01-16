import { Token } from "typedi";
import type { ICategory, ICreateCategory, IUpdateCategory } from "@/types/category.types";

export interface ICategoryRepository {
  create(categoryData: Omit<ICreateCategory, "subcategories">): Promise<ICategory>;
  findById(id: string): Promise<ICategory | null>;
  findByCategoryId(categoryId: string | null): Promise<ICategory[]>;
  findAll(status?: string): Promise<ICategory[]>;
  findAllWithSubcategories(status?: string): Promise<ICategory[]>;
  update(updateData: IUpdateCategory): Promise<ICategory>;
  delete(id: string): Promise<void>;
}

export const CATEGORY_REPOSITORY_TOKEN = new Token<ICategoryRepository>("ICategoryRepository");
