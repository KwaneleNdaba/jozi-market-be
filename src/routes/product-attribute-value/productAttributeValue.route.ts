import { Router } from "express";
import { CreateProductAttributeValueDto, CreateBulkProductAttributeValueDto, UpdateProductAttributeValueDto } from "@/dots/product-attribute-value/productAttributeValue.dot";
import { vendorAuthorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import { ValidationMiddleware } from "@/middlewares/ValidationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { ProductAttributeValueController } from "../../controllers/product-attribute-value/productAttributeValue.controller";

export class ProductAttributeValueRoute implements Routes {
  public path = "/product-attribute-value";
  public router = Router();
  public productAttributeValue = new ProductAttributeValueController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create single product attribute value (vendor/admin only)
    this.router.post(
      `${this.path}`,
      vendorAuthorizationMiddleware,
      ValidationMiddleware(CreateProductAttributeValueDto),
      this.productAttributeValue.createProductAttributeValue
    );

    // Create bulk product attribute values (vendor/admin only)
    this.router.post(
      `${this.path}/bulk`,
      vendorAuthorizationMiddleware,
      ValidationMiddleware(CreateBulkProductAttributeValueDto),
      this.productAttributeValue.createBulkProductAttributeValues
    );

    // Get product attribute values by product ID (public)
    // IMPORTANT: This route must come before /:id to avoid route conflicts
    this.router.get(
      `${this.path}/product/:productId`,
      this.productAttributeValue.getProductAttributeValuesByProductId
    );

    // Get product attribute values by attribute ID (public)
    // IMPORTANT: This route must come before /:id to avoid route conflicts
    this.router.get(
      `${this.path}/attribute/:attributeId`,
      this.productAttributeValue.getProductAttributeValuesByAttributeId
    );

    // Get product attribute value by ID (public)
    this.router.get(
      `${this.path}/:id`,
      this.productAttributeValue.getProductAttributeValueById
    );

    // Get all product attribute values (public)
    this.router.get(
      `${this.path}s`,
      this.productAttributeValue.getAllProductAttributeValues
    );

    // Update product attribute value (vendor/admin only)
    this.router.put(
      `${this.path}`,
      vendorAuthorizationMiddleware,
      ValidationMiddleware(UpdateProductAttributeValueDto),
      this.productAttributeValue.updateProductAttributeValue
    );

    // Delete product attribute value (vendor/admin only)
    this.router.delete(
      `${this.path}/:id`,
      vendorAuthorizationMiddleware,
      this.productAttributeValue.deleteProductAttributeValue
    );

    // Delete all product attribute values by product ID (vendor/admin only)
    this.router.delete(
      `${this.path}/product/:productId`,
      vendorAuthorizationMiddleware,
      this.productAttributeValue.deleteProductAttributeValuesByProductId
    );
  }
}
