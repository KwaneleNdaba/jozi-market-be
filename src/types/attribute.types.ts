export enum AttributeType {
  TEXT = "text",
  NUMBER = "number",
  SELECT = "select",
  BOOLEAN = "boolean",
  TEXTAREA = "textarea",
}

export interface IAttribute {
  id?: string;
  name: string;
  slug: string;
  type: AttributeType | string;
  unit?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateAttribute {
  name: string;
  slug: string;
  type: AttributeType | string;
  unit?: string;
}

export interface IUpdateAttribute {
  id: string;
  name?: string;
  slug?: string;
  type?: AttributeType | string;
  unit?: string;
}

export interface ICategoryAttribute {
  id?: string;
  categoryId: string;
  attributeId: string;
  isRequired: boolean;
  options?: string[];
  displayOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateCategoryAttribute {
  categoryId: string;
  attributeId: string;
  isRequired?: boolean;
  options?: string[];
  displayOrder?: number;
}

export interface IUpdateCategoryAttribute {
  id: string;
  categoryId?: string;
  attributeId?: string;
  isRequired?: boolean;
  options?: string[];
  displayOrder?: number;
}

export interface IProductAttributeValue {
  id?: string;
  productId: string;
  attributeId: string;
  value: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateProductAttributeValue {
  productId: string;
  attributeId: string;
  value: string;
}

export interface IUpdateProductAttributeValue {
  id: string;
  productId?: string;
  attributeId?: string;
  value?: string;
}
