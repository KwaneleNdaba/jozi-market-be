import { Token } from "typedi";
import type { IProduct, ICreateProduct, IUpdateProduct, IPaginatedResponse, IPaginationParams } from "@/types/product.types";

export interface IProductRepository {
  create(productData: ICreateProduct): Promise<IProduct>;
  findById(id: string): Promise<IProduct | null>;
  findBySku(sku: string): Promise<IProduct | null>;
  findByUserId(userId: string, status?: string, pagination?: IPaginationParams): Promise<{ products: IProduct[], total: number }>;
  findByCategoryId(categoryId: string, pagination?: IPaginationParams): Promise<{ products: IProduct[], total: number }>;
  findBySubcategoryId(subcategoryId: string, pagination?: IPaginationParams): Promise<{ products: IProduct[], total: number }>;
  findAll(status?: string, pagination?: IPaginationParams): Promise<{ products: IProduct[], total: number }>;
  update(updateData: IUpdateProduct): Promise<IProduct>;
  delete(id: string): Promise<void>;
}

export const PRODUCT_REPOSITORY_TOKEN = new Token<IProductRepository>("IProductRepository");
