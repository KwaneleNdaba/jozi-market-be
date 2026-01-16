import { Token } from "typedi";
import type { IProductAttributeValue, ICreateProductAttributeValue, IUpdateProductAttributeValue } from "@/types/attribute.types";

export interface IProductAttributeValueService {
  createProductAttributeValue(productAttributeValueData: ICreateProductAttributeValue): Promise<IProductAttributeValue>;
  createBulkProductAttributeValues(productAttributeValuesData: ICreateProductAttributeValue[]): Promise<IProductAttributeValue[]>;
  getProductAttributeValueById(id: string): Promise<IProductAttributeValue | null>;
  getProductAttributeValuesByProductId(productId: string): Promise<IProductAttributeValue[]>;
  getProductAttributeValuesByAttributeId(attributeId: string): Promise<IProductAttributeValue[]>;
  getAllProductAttributeValues(): Promise<IProductAttributeValue[]>;
  updateProductAttributeValue(updateData: IUpdateProductAttributeValue): Promise<IProductAttributeValue>;
  deleteProductAttributeValue(id: string): Promise<void>;
  deleteProductAttributeValuesByProductId(productId: string): Promise<void>;
}

export const PRODUCT_ATTRIBUTE_VALUE_SERVICE_TOKEN = new Token<IProductAttributeValueService>("IProductAttributeValueService");
