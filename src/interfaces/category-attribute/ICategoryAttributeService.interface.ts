import { Token } from "typedi";
import type { ICategoryAttribute, ICreateCategoryAttribute, IUpdateCategoryAttribute } from "@/types/attribute.types";

export interface ICategoryAttributeService {
  createCategoryAttribute(categoryAttributeData: ICreateCategoryAttribute): Promise<ICategoryAttribute>;
  getCategoryAttributeById(id: string): Promise<ICategoryAttribute | null>;
  getCategoryAttributesByCategoryId(categoryId: string): Promise<ICategoryAttribute[]>;
  getAllCategoryAttributes(): Promise<ICategoryAttribute[]>;
  updateCategoryAttribute(updateData: IUpdateCategoryAttribute): Promise<ICategoryAttribute>;
  deleteCategoryAttribute(id: string): Promise<void>;
}

export const CATEGORY_ATTRIBUTE_SERVICE_TOKEN = new Token<ICategoryAttributeService>("ICategoryAttributeService");
