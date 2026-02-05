import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { PRODUCT_SERVICE_TOKEN } from "@/interfaces/product/IProductService.interface";
import type { CustomResponse } from "@/types/response.interface";
import type { IProduct } from "@/types/product.types";
import type { RequestWithUser } from "@/types/auth.types";
import { Role } from "@/types/auth.types";

export class ProductController {
  private readonly productService: any;

  constructor() {
    this.productService = Container.get(PRODUCT_SERVICE_TOKEN);
  }

  public createProduct = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Extract userId from authenticated user
      if (!req.user || !req.user.id) {
        throw new HttpException(401, "User authentication required");
      }

      const productData = {
        ...req.body,
        userId: req.user.id, // Set userId from authenticated user
      };
      const createdProduct = await this.productService.createProduct(productData);

      const response: CustomResponse<IProduct> = {
        data: createdProduct,
        message: "Product created successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);

      if (!product) {
        throw new HttpException(404, "Product not found");
      }

      const response: CustomResponse<IProduct> = {
        data: product,
        message: "Product retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getProductBySku = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { sku } = req.params;
      const product = await this.productService.getProductBySku(sku);

      if (!product) {
        throw new HttpException(404, "Product not found");
      }

      const response: CustomResponse<IProduct> = {
        data: product,
        message: "Product retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getProductsByCategoryId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { categoryId } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      
      const result = await this.productService.getProductsByCategoryId(categoryId, { page, limit });

      const response: CustomResponse<any> = {
        data: result.data,
        pagination: result.pagination,
        message: "Products retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getProductsByUserId = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Get userId from params or authenticated user
      const requestedUserId = req.params.userId || req.user?.id;
      if (!requestedUserId) {
        throw new HttpException(400, "User ID is required");
      }

      // Authorization: Vendors can only see their own products, admins can see any
      if (req.user && req.user.role !== Role.ADMIN && req.user.id !== requestedUserId) {
        throw new HttpException(403, "You can only access your own products");
      }

      const { status } = req.query;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      
      const result = await this.productService.getProductsByUserId(requestedUserId, status as string, { page, limit });

      const response: CustomResponse<any> = {
        data: result.data,
        pagination: result.pagination,
        message: "Products retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getProductsBySubcategoryId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { subcategoryId } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      
      const result = await this.productService.getProductsBySubcategoryId(subcategoryId, { page, limit });

      const response: CustomResponse<any> = {
        data: result.data,
        pagination: result.pagination,
        message: "Products retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getAllProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { status } = req.query;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      
      const result = await this.productService.getAllProducts(status as string, { page, limit });

      const response: CustomResponse<any> = {
        data: result.data,
        pagination: result.pagination,
        message: "Products retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateProduct = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Get the existing product to check ownership
      const existingProduct = await this.productService.getProductById(req.body.id);
      if (!existingProduct) {
        throw new HttpException(404, "Product not found");
      }

      // Authorization: Vendors can only update their own products, admins can update any
      if (req.user && req.user.role !== Role.ADMIN && req.user.id !== existingProduct.userId) {
        throw new HttpException(403, "You can only update your own products");
      }

      // Extract userId from authenticated user if not provided in body
      const updateData = {
        ...req.body,
        // Only set userId from authenticated user if not provided in body
        // This allows admins to update userId if needed
        userId: req.body.userId || (req.user?.id ? req.user.id : undefined),
      };
      const updatedProduct = await this.productService.updateProduct(updateData);

      const response: CustomResponse<IProduct> = {
        data: updatedProduct,
        message: "Product updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteProduct = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      // Get the existing product to check ownership
      const existingProduct = await this.productService.getProductById(id);
      if (!existingProduct) {
        throw new HttpException(404, "Product not found");
      }

      // Authorization: Vendors can only delete their own products, admins can delete any
      if (req.user && req.user.role !== Role.ADMIN && req.user.id !== existingProduct.userId) {
        throw new HttpException(403, "You can only delete your own products");
      }

      await this.productService.deleteProduct(id);

      const response: CustomResponse<null> = {
        data: null,
        message: "Product deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
