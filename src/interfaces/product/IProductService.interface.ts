import { Token } from "typedi";
import type { IProduct, ICreateProduct, IUpdateProduct, IPaginatedResponse, IPaginationParams } from "@/types/product.types";

export interface IProductService {
  createProduct(productData: ICreateProduct): Promise<IProduct>;
  getProductById(id: string): Promise<IProduct | null>;
  getProductBySku(sku: string): Promise<IProduct | null>;
  getProductsByUserId(userId: string, status?: string, pagination?: IPaginationParams): Promise<IPaginatedResponse<IProduct>>;
  getProductsByCategoryId(categoryId: string, pagination?: IPaginationParams): Promise<IPaginatedResponse<IProduct>>;
  getProductsBySubcategoryId(subcategoryId: string, pagination?: IPaginationParams): Promise<IPaginatedResponse<IProduct>>;
  getAllProducts(status?: string, pagination?: IPaginationParams): Promise<IPaginatedResponse<IProduct>>;
  updateProduct(updateData: IUpdateProduct): Promise<IProduct>;
  deleteProduct(id: string): Promise<void>;
}

export const PRODUCT_SERVICE_TOKEN = new Token<IProductService>("IProductService");
