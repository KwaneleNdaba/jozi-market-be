import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  type ICategoryAttributeRepository,
  CATEGORY_ATTRIBUTE_REPOSITORY_TOKEN,
} from "@/interfaces/category-attribute/ICategoryAttributeRepository.interface";
import CategoryAttribute from "@/models/category-attribute/categoryAttribute.model";
import type { ICategoryAttribute, ICreateCategoryAttribute, IUpdateCategoryAttribute } from "@/types/attribute.types";
import Attribute from "@/models/attribute/attribute.model";

@Service({ id: CATEGORY_ATTRIBUTE_REPOSITORY_TOKEN })
export class CategoryAttributeRepository implements ICategoryAttributeRepository {
  public async create(categoryAttributeData: ICreateCategoryAttribute): Promise<ICategoryAttribute> {
    try {
      const createdCategoryAttribute = await CategoryAttribute.create(categoryAttributeData as any, {
        raw: false,
      });

      return createdCategoryAttribute.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<ICategoryAttribute | null> {
    try {
      const categoryAttribute = await CategoryAttribute.findByPk(id, { raw: true });
      return categoryAttribute;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByCategoryId(categoryId: string): Promise<ICategoryAttribute[]> {
    try {
      const categoryAttributes = await CategoryAttribute.findAll({
        where: { categoryId },
        include: [
          {
            model: Attribute,
            as: "attribute",
            required: true,
          },
        ],
        raw: false,
        order: [["displayOrder", "ASC"], ["createdAt", "ASC"]],
      });

      return categoryAttributes.map((ca) => ca.get({ plain: true }));
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(): Promise<ICategoryAttribute[]> {
    try {
      const categoryAttributes = await CategoryAttribute.findAll({
        include: [
          {
            model: Attribute,
            as: "attribute",
            required: true,
          },
        ],
        raw: false,
        order: [["createdAt", "ASC"]],
      });

      return categoryAttributes.map((ca) => ca.get({ plain: true }));
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async update(updateData: IUpdateCategoryAttribute): Promise<ICategoryAttribute> {
    try {
      const categoryAttribute = await CategoryAttribute.findOne({
        where: { id: updateData.id },
        raw: false,
      });

      if (!categoryAttribute) {
        throw new HttpException(404, "Category attribute not found");
      }

      const updatePayload: any = {};
      if (updateData.categoryId !== undefined) updatePayload.categoryId = updateData.categoryId;
      if (updateData.attributeId !== undefined) updatePayload.attributeId = updateData.attributeId;
      if (updateData.isRequired !== undefined) updatePayload.isRequired = updateData.isRequired;
      if (updateData.options !== undefined) updatePayload.options = updateData.options;
      if (updateData.displayOrder !== undefined) updatePayload.displayOrder = updateData.displayOrder;

      await categoryAttribute.update(updatePayload);

      return categoryAttribute.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const categoryAttribute = await CategoryAttribute.findOne({
        where: { id },
      });

      if (!categoryAttribute) {
        throw new HttpException(404, "Category attribute not found");
      }

      await categoryAttribute.destroy();
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }
}
