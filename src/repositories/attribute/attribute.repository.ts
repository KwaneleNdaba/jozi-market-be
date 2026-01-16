import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  type IAttributeRepository,
  ATTRIBUTE_REPOSITORY_TOKEN,
} from "@/interfaces/attribute/IAttributeRepository.interface";
import Attribute from "@/models/attribute/attribute.model";
import type { IAttribute, ICreateAttribute, IUpdateAttribute } from "@/types/attribute.types";

@Service({ id: ATTRIBUTE_REPOSITORY_TOKEN })
export class AttributeRepository implements IAttributeRepository {
  public async create(attributeData: ICreateAttribute): Promise<IAttribute> {
    try {
      const createdAttribute = await Attribute.create(attributeData as any, {
        raw: false,
      });

      return createdAttribute.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<IAttribute | null> {
    try {
      const attribute = await Attribute.findByPk(id, { raw: true });
      return attribute;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findBySlug(slug: string): Promise<IAttribute | null> {
    try {
      const attribute = await Attribute.findOne({
        where: { slug },
        raw: true,
      });
      return attribute;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(): Promise<IAttribute[]> {
    try {
      const attributes = await Attribute.findAll({
        raw: true,
        order: [["createdAt", "ASC"]],
      });

      return attributes;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async update(updateData: IUpdateAttribute): Promise<IAttribute> {
    try {
      const attribute = await Attribute.findOne({
        where: { id: updateData.id },
        raw: false,
      });

      if (!attribute) {
        throw new HttpException(404, "Attribute not found");
      }

      const updatePayload: any = {};
      if (updateData.name !== undefined) updatePayload.name = updateData.name;
      if (updateData.slug !== undefined) updatePayload.slug = updateData.slug;
      if (updateData.type !== undefined) updatePayload.type = updateData.type;
      if (updateData.unit !== undefined) updatePayload.unit = updateData.unit;

      await attribute.update(updatePayload);

      return attribute.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const attribute = await Attribute.findOne({
        where: { id },
      });

      if (!attribute) {
        throw new HttpException(404, "Attribute not found");
      }

      await attribute.destroy();
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }
}
