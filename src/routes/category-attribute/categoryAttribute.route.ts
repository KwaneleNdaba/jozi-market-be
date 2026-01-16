import { Router } from "express";
import { CreateCategoryAttributeDto, UpdateCategoryAttributeDto } from "@/dots/category-attribute/categoryAttribute.dot";
import { adminAuthorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import { ValidationMiddleware } from "@/middlewares/ValidationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { CategoryAttributeController } from "../../controllers/category-attribute/categoryAttribute.controller";

export class CategoryAttributeRoute implements Routes {
  public path = "/category-attribute";
  public router = Router();
  public categoryAttribute = new CategoryAttributeController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create category attribute (admin only)
    this.router.post(
      `${this.path}`,
      adminAuthorizationMiddleware,
      ValidationMiddleware(CreateCategoryAttributeDto),
      this.categoryAttribute.createCategoryAttribute
    );

    // Get category attributes by category ID (public) - IMPORTANT: This route must come before /:id
    this.router.get(
      `${this.path}/category/:categoryId`,
      this.categoryAttribute.getCategoryAttributesByCategoryId
    );

    // Get category attribute by ID (public)
    this.router.get(
      `${this.path}/:id`,
      this.categoryAttribute.getCategoryAttributeById
    );

    // Get all category attributes (public)
    this.router.get(
      `${this.path}s`,
      this.categoryAttribute.getAllCategoryAttributes
    );

    // Update category attribute (admin only)
    this.router.put(
      `${this.path}`,
      adminAuthorizationMiddleware,
      ValidationMiddleware(UpdateCategoryAttributeDto),
      this.categoryAttribute.updateCategoryAttribute
    );

    // Delete category attribute (admin only)
    this.router.delete(
      `${this.path}/:id`,
      adminAuthorizationMiddleware,
      this.categoryAttribute.deleteCategoryAttribute
    );
  }
}
