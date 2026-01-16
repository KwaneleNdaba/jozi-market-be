import { Inject, Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { type IAttributeRepository, ATTRIBUTE_REPOSITORY_TOKEN } from "@/interfaces/attribute/IAttributeRepository.interface";
import { type IAttributeService, ATTRIBUTE_SERVICE_TOKEN } from "@/interfaces/attribute/IAttributeService.interface";
import type { IAttribute, ICreateAttribute, IUpdateAttribute } from "@/types/attribute.types";

@Service({ id: ATTRIBUTE_SERVICE_TOKEN })
export class AttributeService implements IAttributeService {
  constructor(@Inject(ATTRIBUTE_REPOSITORY_TOKEN) private readonly attributeRepository: IAttributeRepository) {}

  public async createAttribute(attributeData: ICreateAttribute): Promise<IAttribute> {
    try {
      // Check if slug already exists
      const existingAttribute = await this.attributeRepository.findBySlug(attributeData.slug);
      if (existingAttribute) {
        throw new HttpException(409, "An attribute with this slug already exists");
      }

      return await this.attributeRepository.create(attributeData);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async getAttributeById(id: string): Promise<IAttribute | null> {
    try {
      return await this.attributeRepository.findById(id);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getAttributeBySlug(slug: string): Promise<IAttribute | null> {
    try {
      return await this.attributeRepository.findBySlug(slug);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getAllAttributes(): Promise<IAttribute[]> {
    try {
      return await this.attributeRepository.findAll();
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async updateAttribute(updateData: IUpdateAttribute): Promise<IAttribute> {
    try {
      const attribute = await this.attributeRepository.findById(updateData.id);
      if (!attribute) {
        throw new HttpException(404, "Attribute not found");
      }

      // If slug is being updated, check if new slug already exists
      if (updateData.slug && updateData.slug !== attribute.slug) {
        const existingAttribute = await this.attributeRepository.findBySlug(updateData.slug);
        if (existingAttribute) {
          throw new HttpException(409, "An attribute with this slug already exists");
        }
      }

      return await this.attributeRepository.update(updateData);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async deleteAttribute(id: string): Promise<void> {
    try {
      const attribute = await this.attributeRepository.findById(id);
      if (!attribute) {
        throw new HttpException(404, "Attribute not found");
      }

      await this.attributeRepository.delete(id);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }
}
