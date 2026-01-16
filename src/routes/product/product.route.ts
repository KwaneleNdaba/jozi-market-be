import { Router } from "express";
import { CreateProductDto, UpdateProductDto } from "@/dots/product/product.dot";
import { vendorAuthorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import { ValidationMiddleware } from "@/middlewares/ValidationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { ProductController } from "../../controllers/product/product.controller";

export class ProductRoute implements Routes {
  public path = "/product";
  public router = Router();
  public product = new ProductController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create product (vendor/admin only)
    this.router.post(
      `${this.path}`,
      vendorAuthorizationMiddleware,
      ValidationMiddleware(CreateProductDto),
      this.product.createProduct
    );

    // Get products by user ID (authenticated - vendor can see their own, admin can see any)
    // IMPORTANT: This route must come before /:id to avoid route conflicts
    this.router.get(
      `${this.path}/user/:userId`,
      vendorAuthorizationMiddleware,
      this.product.getProductsByUserId
    );

    // Get products by subcategory ID (public)
    // IMPORTANT: This route must come before /:id to avoid route conflicts
    this.router.get(
      `${this.path}/subcategory/:subcategoryId`,
      this.product.getProductsBySubcategoryId
    );

    // Get products by category ID (public)
    // IMPORTANT: This route must come before /:id to avoid route conflicts
    this.router.get(
      `${this.path}/category/:categoryId`,
      this.product.getProductsByCategoryId
    );

    // Get product by SKU (public)
    // IMPORTANT: This route must come before /:id to avoid route conflicts
    this.router.get(
      `${this.path}/sku/:sku`,
      this.product.getProductBySku
    );

    // Get product by ID (public)
    this.router.get(
      `${this.path}/:id`,
      this.product.getProductById
    );

    // Get all products with optional status filter (public)
    this.router.get(
      `${this.path}s`,
      this.product.getAllProducts
    );

    // Update product (vendor/admin only)
    this.router.put(
      `${this.path}`,
      vendorAuthorizationMiddleware,
      ValidationMiddleware(UpdateProductDto),
      this.product.updateProduct
    );

    // Delete product (vendor/admin only)
    this.router.delete(
      `${this.path}/:id`,
      vendorAuthorizationMiddleware,
      this.product.deleteProduct
    );
  }
}
