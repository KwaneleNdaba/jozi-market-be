import { Token } from "typedi";
import type { IAttribute, ICreateAttribute, IUpdateAttribute } from "@/types/attribute.types";

export interface IAttributeService {
  createAttribute(attributeData: ICreateAttribute): Promise<IAttribute>;
  getAttributeById(id: string): Promise<IAttribute | null>;
  getAttributeBySlug(slug: string): Promise<IAttribute | null>;
  getAllAttributes(): Promise<IAttribute[]>;
  updateAttribute(updateData: IUpdateAttribute): Promise<IAttribute>;
  deleteAttribute(id: string): Promise<void>;
}

export const ATTRIBUTE_SERVICE_TOKEN = new Token<IAttributeService>("IAttributeService");
