import { Token } from "typedi";
import type { IProductAttributeValue, ICreateProductAttributeValue, IUpdateProductAttributeValue } from "@/types/attribute.types";

export interface IProductAttributeValueRepository {
  create(productAttributeValueData: ICreateProductAttributeValue): Promise<IProductAttributeValue>;
  createBulk(productAttributeValuesData: ICreateProductAttributeValue[]): Promise<IProductAttributeValue[]>;
  findById(id: string): Promise<IProductAttributeValue | null>;
  findByProductId(productId: string): Promise<IProductAttributeValue[]>;
  findByAttributeId(attributeId: string): Promise<IProductAttributeValue[]>;
  findAll(): Promise<IProductAttributeValue[]>;
  update(updateData: IUpdateProductAttributeValue): Promise<IProductAttributeValue>;
  delete(id: string): Promise<void>;
  deleteByProductId(productId: string): Promise<void>;
}

export const PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN = new Token<IProductAttributeValueRepository>("IProductAttributeValueRepository");
