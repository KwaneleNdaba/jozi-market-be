import { Router } from "express";
import { CreateAttributeDto, UpdateAttributeDto } from "@/dots/attribute/attribute.dot";
import { adminAuthorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import { ValidationMiddleware } from "@/middlewares/ValidationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { AttributeController } from "../../controllers/attribute/attribute.controller";

export class AttributeRoute implements Routes {
  public path = "/attribute";
  public router = Router();
  public attribute = new AttributeController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create attribute (admin only)
    this.router.post(
      `${this.path}`,
      adminAuthorizationMiddleware,
      ValidationMiddleware(CreateAttributeDto),
      this.attribute.createAttribute
    );

    // Get attribute by slug (public)
    this.router.get(
      `${this.path}/slug/:slug`,
      this.attribute.getAttributeBySlug
    );

    // Get attribute by ID (public)
    this.router.get(
      `${this.path}/:id`,
      this.attribute.getAttributeById
    );

    // Get all attributes (public)
    this.router.get(
      `${this.path}s`,
      this.attribute.getAllAttributes
    );

    // Update attribute (admin only)
    this.router.put(
      `${this.path}`,
      adminAuthorizationMiddleware,
      ValidationMiddleware(UpdateAttributeDto),
      this.attribute.updateAttribute
    );

    // Delete attribute (admin only)
    this.router.delete(
      `${this.path}/:id`,
      adminAuthorizationMiddleware,
      this.attribute.deleteAttribute
    );
  }
}
