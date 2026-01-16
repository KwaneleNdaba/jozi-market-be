import { Inject, Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { type IProductAttributeValueRepository, PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN } from "@/interfaces/product-attribute-value/IProductAttributeValueRepository.interface";
import { type IProductAttributeValueService, PRODUCT_ATTRIBUTE_VALUE_SERVICE_TOKEN } from "@/interfaces/product-attribute-value/IProductAttributeValueService.interface";
import type { IProductAttributeValue, ICreateProductAttributeValue, IUpdateProductAttributeValue } from "@/types/attribute.types";

@Service({ id: PRODUCT_ATTRIBUTE_VALUE_SERVICE_TOKEN })
export class ProductAttributeValueService implements IProductAttributeValueService {
  constructor(@Inject(PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN) private readonly productAttributeValueRepository: IProductAttributeValueRepository) {}

  public async createProductAttributeValue(productAttributeValueData: ICreateProductAttributeValue): Promise<IProductAttributeValue> {
    try {
      return await this.productAttributeValueRepository.create(productAttributeValueData);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async createBulkProductAttributeValues(productAttributeValuesData: ICreateProductAttributeValue[]): Promise<IProductAttributeValue[]> {
    try {
      if (!productAttributeValuesData || productAttributeValuesData.length === 0) {
        throw new HttpException(400, "Product attribute values data is required");
      }

      return await this.productAttributeValueRepository.createBulk(productAttributeValuesData);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async getProductAttributeValueById(id: string): Promise<IProductAttributeValue | null> {
    try {
      return await this.productAttributeValueRepository.findById(id);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getProductAttributeValuesByProductId(productId: string): Promise<IProductAttributeValue[]> {
    try {
      return await this.productAttributeValueRepository.findByProductId(productId);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getProductAttributeValuesByAttributeId(attributeId: string): Promise<IProductAttributeValue[]> {
    try {
      return await this.productAttributeValueRepository.findByAttributeId(attributeId);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getAllProductAttributeValues(): Promise<IProductAttributeValue[]> {
    try {
      return await this.productAttributeValueRepository.findAll();
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async updateProductAttributeValue(updateData: IUpdateProductAttributeValue): Promise<IProductAttributeValue> {
    try {
      const productAttributeValue = await this.productAttributeValueRepository.findById(updateData.id);
      if (!productAttributeValue) {
        throw new HttpException(404, "Product attribute value not found");
      }

      return await this.productAttributeValueRepository.update(updateData);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async deleteProductAttributeValue(id: string): Promise<void> {
    try {
      const productAttributeValue = await this.productAttributeValueRepository.findById(id);
      if (!productAttributeValue) {
        throw new HttpException(404, "Product attribute value not found");
      }

      await this.productAttributeValueRepository.delete(id);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async deleteProductAttributeValuesByProductId(productId: string): Promise<void> {
    try {
      await this.productAttributeValueRepository.deleteByProductId(productId);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }
}
