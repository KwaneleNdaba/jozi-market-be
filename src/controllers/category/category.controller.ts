import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { CATEGORY_SERVICE_TOKEN } from "@/interfaces/category/ICategoryService.interface";
import type { CustomResponse } from "@/types/response.interface";
import type { ICategory } from "@/types/category.types";

export class CategoryController {
  private readonly categoryService: any;

  constructor() {
    this.categoryService = Container.get(CATEGORY_SERVICE_TOKEN);
  }

  public createCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const categoryData = req.body;
      const createdCategory = await this.categoryService.createCategory(categoryData);

      const response: CustomResponse<ICategory> = {
        data: createdCategory,
        message: "Category created successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getCategoryById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await this.categoryService.getCategoryById(id);

      if (!category) {
        throw new HttpException(404, "Category not found");
      }

      const response: CustomResponse<ICategory> = {
        data: category,
        message: "Category retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getSubcategoriesByCategoryId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { categoryId } = req.params;
      const subcategories = await this.categoryService.getSubcategoriesByCategoryId(categoryId);

      const response: CustomResponse<ICategory[]> = {
        data: subcategories,
        message: "Subcategories retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getAllCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { status } = req.query;
      const categories = await this.categoryService.getAllCategories(status as string);

      const response: CustomResponse<ICategory[]> = {
        data: categories,
        message: "Categories retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updateData = req.body;
      const updatedCategory = await this.categoryService.updateCategory(updateData);

      const response: CustomResponse<ICategory> = {
        data: updatedCategory,
        message: "Category updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.categoryService.deleteCategory(id);

      const response: CustomResponse<null> = {
        data: null,
        message: "Category deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
