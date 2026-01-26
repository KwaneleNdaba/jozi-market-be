import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  type IProductAttributeValueRepository,
  PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN,
} from "@/interfaces/product-attribute-value/IProductAttributeValueRepository.interface";
import ProductAttributeValue from "@/models/product-attribute-value/productAttributeValue.model";
import type { IProductAttributeValue, ICreateProductAttributeValue, IUpdateProductAttributeValue } from "@/types/attribute.types";
import Attribute from "@/models/attribute/attribute.model";

@Service({ id: PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN })
export class ProductAttributeValueRepository implements IProductAttributeValueRepository {
  public async create(productAttributeValueData: ICreateProductAttributeValue): Promise<IProductAttributeValue> {
    try {
      const createdProductAttributeValue = await ProductAttributeValue.create(productAttributeValueData as any, {
        raw: false,
      });

      return createdProductAttributeValue.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async createBulk(productAttributeValuesData: ICreateProductAttributeValue[]): Promise<IProductAttributeValue[]> {
    try {
      const createdProductAttributeValues = await ProductAttributeValue.bulkCreate(
        productAttributeValuesData as any[],
        { returning: true }
      );

      return createdProductAttributeValues.map((pav) => pav.get({ plain: true }));
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<IProductAttributeValue | null> {
    try {
      const productAttributeValue = await ProductAttributeValue.findByPk(id, {
        include: [
          {
            model: Attribute,
            as: "attribute",
            required: false,
          },
        ],
        raw: false,
      });

      return productAttributeValue ? productAttributeValue.get({ plain: true }) : null;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByProductId(productId: string): Promise<IProductAttributeValue[]> {
    try {
      const productAttributeValues = await ProductAttributeValue.findAll({
        where: { productId },
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

      return productAttributeValues.map((pav) => pav.get({ plain: true }));
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByAttributeId(attributeId: string): Promise<IProductAttributeValue[]> {
    try {
      const productAttributeValues = await ProductAttributeValue.findAll({
        where: { attributeId },
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

      return productAttributeValues.map((pav) => pav.get({ plain: true }));
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(): Promise<IProductAttributeValue[]> {
    try {
      const productAttributeValues = await ProductAttributeValue.findAll({
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

      return productAttributeValues.map((pav) => pav.get({ plain: true }));
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async update(updateData: IUpdateProductAttributeValue): Promise<IProductAttributeValue> {
    try {
      const productAttributeValue = await ProductAttributeValue.findOne({
        where: { id: updateData.id },
        raw: false,
      });

      if (!productAttributeValue) {
        throw new HttpException(404, "Product attribute value not found");
      }

      const updatePayload: any = {};
      if (updateData.productId !== undefined) updatePayload.productId = updateData.productId;
      if (updateData.attributeId !== undefined) updatePayload.attributeId = updateData.attributeId;
      if (updateData.value !== undefined) updatePayload.value = updateData.value;

      await productAttributeValue.update(updatePayload);

      return productAttributeValue.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const productAttributeValue = await ProductAttributeValue.findOne({
        where: { id },
      });

      if (!productAttributeValue) {
        throw new HttpException(404, "Product attribute value not found");
      }

      await productAttributeValue.destroy();
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async deleteByProductId(productId: string): Promise<void> {
    try {
      await ProductAttributeValue.destroy({
        where: { productId },
      });
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }
}
