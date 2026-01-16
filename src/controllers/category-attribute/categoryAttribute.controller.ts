import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { CATEGORY_ATTRIBUTE_SERVICE_TOKEN } from "@/interfaces/category-attribute/ICategoryAttributeService.interface";
import type { CustomResponse } from "@/types/response.interface";
import type { ICategoryAttribute } from "@/types/attribute.types";

export class CategoryAttributeController {
  private readonly categoryAttributeService: any;

  constructor() {
    this.categoryAttributeService = Container.get(CATEGORY_ATTRIBUTE_SERVICE_TOKEN);
  }

  public createCategoryAttribute = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const categoryAttributeData = req.body;
      const createdCategoryAttribute = await this.categoryAttributeService.createCategoryAttribute(categoryAttributeData);

      const response: CustomResponse<ICategoryAttribute> = {
        data: createdCategoryAttribute,
        message: "Category attribute created successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getCategoryAttributeById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const categoryAttribute = await this.categoryAttributeService.getCategoryAttributeById(id);

      if (!categoryAttribute) {
        throw new HttpException(404, "Category attribute not found");
      }

      const response: CustomResponse<ICategoryAttribute> = {
        data: categoryAttribute,
        message: "Category attribute retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getCategoryAttributesByCategoryId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { categoryId } = req.params;
      const categoryAttributes = await this.categoryAttributeService.getCategoryAttributesByCategoryId(categoryId);

      const response: CustomResponse<ICategoryAttribute[]> = {
        data: categoryAttributes,
        message: "Category attributes retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getAllCategoryAttributes = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const categoryAttributes = await this.categoryAttributeService.getAllCategoryAttributes();

      const response: CustomResponse<ICategoryAttribute[]> = {
        data: categoryAttributes,
        message: "Category attributes retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateCategoryAttribute = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updateData = req.body;
      const updatedCategoryAttribute = await this.categoryAttributeService.updateCategoryAttribute(updateData);

      const response: CustomResponse<ICategoryAttribute> = {
        data: updatedCategoryAttribute,
        message: "Category attribute updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteCategoryAttribute = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.categoryAttributeService.deleteCategoryAttribute(id);

      const response: CustomResponse<null> = {
        data: null,
        message: "Category attribute deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
