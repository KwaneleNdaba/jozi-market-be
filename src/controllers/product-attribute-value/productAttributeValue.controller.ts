import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { PRODUCT_ATTRIBUTE_VALUE_SERVICE_TOKEN } from "@/interfaces/product-attribute-value/IProductAttributeValueService.interface";
import type { CustomResponse } from "@/types/response.interface";
import type { IProductAttributeValue, ICreateProductAttributeValue } from "@/types/attribute.types";

export class ProductAttributeValueController {
  private readonly productAttributeValueService: any;

  constructor() {
    this.productAttributeValueService = Container.get(PRODUCT_ATTRIBUTE_VALUE_SERVICE_TOKEN);
  }

  public createProductAttributeValue = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const productAttributeValueData: ICreateProductAttributeValue = req.body;
      const createdProductAttributeValue = await this.productAttributeValueService.createProductAttributeValue(productAttributeValueData);

      const response: CustomResponse<IProductAttributeValue> = {
        data: createdProductAttributeValue,
        message: "Product attribute value created successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public createBulkProductAttributeValues = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { productId, attributes } = req.body;

      if (!productId || !attributes || !Array.isArray(attributes) || attributes.length === 0) {
        throw new HttpException(400, "productId and attributes array are required");
      }

      const productAttributeValuesData: ICreateProductAttributeValue[] = attributes.map(
        (attr: { attributeId: string; value: string }) => ({
          productId,
          attributeId: attr.attributeId,
          value: attr.value,
        })
      );

      const createdProductAttributeValues = await this.productAttributeValueService.createBulkProductAttributeValues(productAttributeValuesData);

      const response: CustomResponse<IProductAttributeValue[]> = {
        data: createdProductAttributeValues,
        message: "Product attribute values created successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getProductAttributeValueById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const productAttributeValue = await this.productAttributeValueService.getProductAttributeValueById(id);

      if (!productAttributeValue) {
        throw new HttpException(404, "Product attribute value not found");
      }

      const response: CustomResponse<IProductAttributeValue> = {
        data: productAttributeValue,
        message: "Product attribute value retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getProductAttributeValuesByProductId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { productId } = req.params;
      const productAttributeValues = await this.productAttributeValueService.getProductAttributeValuesByProductId(productId);

      const response: CustomResponse<IProductAttributeValue[]> = {
        data: productAttributeValues,
        message: "Product attribute values retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getProductAttributeValuesByAttributeId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { attributeId } = req.params;
      const productAttributeValues = await this.productAttributeValueService.getProductAttributeValuesByAttributeId(attributeId);

      const response: CustomResponse<IProductAttributeValue[]> = {
        data: productAttributeValues,
        message: "Product attribute values retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getAllProductAttributeValues = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const productAttributeValues = await this.productAttributeValueService.getAllProductAttributeValues();

      const response: CustomResponse<IProductAttributeValue[]> = {
        data: productAttributeValues,
        message: "Product attribute values retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateProductAttributeValue = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updateData = req.body;
      const updatedProductAttributeValue = await this.productAttributeValueService.updateProductAttributeValue(updateData);

      const response: CustomResponse<IProductAttributeValue> = {
        data: updatedProductAttributeValue,
        message: "Product attribute value updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteProductAttributeValue = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.productAttributeValueService.deleteProductAttributeValue(id);

      const response: CustomResponse<null> = {
        data: null,
        message: "Product attribute value deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteProductAttributeValuesByProductId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { productId } = req.params;
      await this.productAttributeValueService.deleteProductAttributeValuesByProductId(productId);

      const response: CustomResponse<null> = {
        data: null,
        message: "Product attribute values deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
