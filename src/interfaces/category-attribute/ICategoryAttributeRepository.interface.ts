import { Token } from "typedi";
import type { ICategoryAttribute, ICreateCategoryAttribute, IUpdateCategoryAttribute } from "@/types/attribute.types";

export interface ICategoryAttributeRepository {
  create(categoryAttributeData: ICreateCategoryAttribute): Promise<ICategoryAttribute>;
  findById(id: string): Promise<ICategoryAttribute | null>;
  findByCategoryId(categoryId: string): Promise<ICategoryAttribute[]>;
  findAll(): Promise<ICategoryAttribute[]>;
  update(updateData: IUpdateCategoryAttribute): Promise<ICategoryAttribute>;
  delete(id: string): Promise<void>;
}

export const CATEGORY_ATTRIBUTE_REPOSITORY_TOKEN = new Token<ICategoryAttributeRepository>("ICategoryAttributeRepository");
