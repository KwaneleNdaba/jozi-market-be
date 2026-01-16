import { Token } from "typedi";
import type { IProduct, ICreateProduct, IUpdateProduct } from "@/types/product.types";

export interface IProductService {
  createProduct(productData: ICreateProduct): Promise<IProduct>;
  getProductById(id: string): Promise<IProduct | null>;
  getProductBySku(sku: string): Promise<IProduct | null>;
  getProductsByUserId(userId: string, status?: string): Promise<IProduct[]>;
  getProductsByCategoryId(categoryId: string): Promise<IProduct[]>;
  getProductsBySubcategoryId(subcategoryId: string): Promise<IProduct[]>;
  getAllProducts(status?: string): Promise<IProduct[]>;
  updateProduct(updateData: IUpdateProduct): Promise<IProduct>;
  deleteProduct(id: string): Promise<void>;
}

export const PRODUCT_SERVICE_TOKEN = new Token<IProductService>("IProductService");
