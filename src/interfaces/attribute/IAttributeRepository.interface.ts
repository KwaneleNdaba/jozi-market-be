import { Token } from "typedi";
import type { IAttribute, ICreateAttribute, IUpdateAttribute } from "@/types/attribute.types";

export interface IAttributeRepository {
  create(attributeData: ICreateAttribute): Promise<IAttribute>;
  findById(id: string): Promise<IAttribute | null>;
  findBySlug(slug: string): Promise<IAttribute | null>;
  findAll(): Promise<IAttribute[]>;
  update(updateData: IUpdateAttribute): Promise<IAttribute>;
  delete(id: string): Promise<void>;
}

export const ATTRIBUTE_REPOSITORY_TOKEN = new Token<IAttributeRepository>("IAttributeRepository");
