import { Router } from "express";
import { CreateCategoryDto, UpdateCategoryDto } from "@/dots/category/category.dot";
import { adminAuthorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import { ValidationMiddleware } from "@/middlewares/ValidationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { CategoryController } from "../../controllers/category/category.controller";

export class CategoryRoute implements Routes {
  public path = "/category";
  public router = Router();
  public category = new CategoryController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create category (admin only)
    this.router.post(
      `${this.path}`,
      adminAuthorizationMiddleware,
      ValidationMiddleware(CreateCategoryDto),
      this.category.createCategory
    );

    // Get subcategories by category ID (public)
    // Note: This route must come before the /:id route to avoid route conflicts
    this.router.get(
      `${this.path}/:categoryId/subcategories`,
      this.category.getSubcategoriesByCategoryId
    );

    // Get category by ID (public)
    this.router.get(
      `${this.path}/:id`,
      this.category.getCategoryById
    );

    // Get all categories with optional status filter (public)
    this.router.get(
      "/categories",
      this.category.getAllCategories
    );

    // Update category (admin only)
    this.router.put(
      `${this.path}`,
      adminAuthorizationMiddleware,
      ValidationMiddleware(UpdateCategoryDto),
      this.category.updateCategory
    );

    // Delete category (admin only)
    this.router.delete(
      `${this.path}/:id`,
      adminAuthorizationMiddleware,
      this.category.deleteCategory
    );
  }
}
