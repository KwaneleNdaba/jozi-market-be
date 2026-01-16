import { Token } from "typedi";
import type { IProduct, ICreateProduct, IUpdateProduct } from "@/types/product.types";

export interface IProductRepository {
  create(productData: ICreateProduct): Promise<IProduct>;
  findById(id: string): Promise<IProduct | null>;
  findBySku(sku: string): Promise<IProduct | null>;
  findByUserId(userId: string, status?: string): Promise<IProduct[]>;
  findByCategoryId(categoryId: string): Promise<IProduct[]>;
  findBySubcategoryId(subcategoryId: string): Promise<IProduct[]>;
  findAll(status?: string): Promise<IProduct[]>;
  update(updateData: IUpdateProduct): Promise<IProduct>;
  delete(id: string): Promise<void>;
}

export const PRODUCT_REPOSITORY_TOKEN = new Token<IProductRepository>("IProductRepository");
