import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  type IProductRepository,
  PRODUCT_REPOSITORY_TOKEN,
} from "@/interfaces/product/IProductRepository.interface";
import Product from "@/models/product/product.model";
import ProductVariant from "@/models/product-variant/productVariant.model";
import User from "@/models/user/user.model";
import VendorApplication from "@/models/vendor-application/vendorApplication.model";
import Inventory from "@/models/inventory/inventory.model";
import type { IProduct, ICreateProduct, IUpdateProduct } from "@/types/product.types";

@Service({ id: PRODUCT_REPOSITORY_TOKEN })
export class ProductRepository implements IProductRepository {
  // Helper method to get standard includes with inventory
  private getProductIncludes(): any[] {
    return [
      {
        model: ProductVariant,
        as: "variants",
        required: false,
        include: [
          {
            model: Inventory,
            as: "inventory",
            required: false,
            attributes: ["quantityAvailable", "quantityReserved", "reorderLevel"],
          },
        ],
      },
      {
        model: User,
        as: "vendor",
        required: true,
        where: { isStoreActive: true },
        include: [
          {
            model: VendorApplication,
            as: "applicant",
            required: false,
            attributes: ["shopName", "status", "submittedAt", "description", "files"],
            order: [["submittedAt", "DESC"]],
          },
        ],
      },
      {
        model: Inventory,
        as: "inventory",
        required: false,
        attributes: ["quantityAvailable", "quantityReserved", "reorderLevel"],
      },
    ];
  }

  public async create(productData: ICreateProduct): Promise<IProduct> {
    try {
      // Extract variants and attributes from productData
      const { variants, technicalDetails, ...productFields } = productData;

      // Prepare product data for database (flatten technicalDetails)
      const dbProductData: any = {
        userId: productFields.userId,
        title: productFields.title,
        description: productFields.description,
        sku: productFields.sku,
        status: productFields.status,
        categoryId: technicalDetails.categoryId,
        subcategoryId: technicalDetails.subcategoryId || null,
        regularPrice: technicalDetails.regularPrice,
        discountPrice: technicalDetails.discountPrice || null,
        initialStock: technicalDetails.initialStock !== undefined ? technicalDetails.initialStock : null,
        images: productFields.images,
        video: productFields.video || null,
      };

      const createdProduct = await Product.create(dbProductData as any, {
        raw: false,
      });

      // Create variants if provided
      if (variants && variants.length > 0) {
        const createdVariants = await ProductVariant.bulkCreate(
          variants.map((variant) => ({
            ...variant,
            productId: createdProduct.id,
          })) as any[]
        );

        // Create inventory records for each variant
        await Inventory.bulkCreate(
          createdVariants.map((variant: any) => ({
            productVariantId: variant.id,
            productId: null,
            quantityAvailable: variant.stock || 0,
            quantityReserved: 0,
            reorderLevel: 10, // Default reorder level
          }))
        );
      } else if (technicalDetails.initialStock !== undefined && technicalDetails.initialStock !== null) {
        // Create inventory for product without variants
        await Inventory.create({
          productId: createdProduct.id,
          productVariantId: null,
          quantityAvailable: technicalDetails.initialStock,
          quantityReserved: 0,
          reorderLevel: 10, // Default reorder level
        } as any);
      }

      return createdProduct.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<any> {
    try {
      const product = await Product.findByPk(id, {
        include: this.getProductIncludes(),
        raw: false,
      });

      if (!product) {
        return null;
      }

      const productData = product.get({ plain: true });
      return productData;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findBySku(sku: string): Promise<any> {
    try {
      const product = await Product.findOne({
        where: { sku },
        include: this.getProductIncludes(),
        raw: false,
      });

      if (!product) {
        return null;
      }

      return product.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByCategoryId(categoryId: string, pagination?: { page?: number; limit?: number }): Promise<{ products: any[], total: number }> {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;

      const { count, rows: products } = await Product.findAndCountAll({
        where: { categoryId },
        include: this.getProductIncludes(),
        raw: false,
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });

      return {
        products: products.map((product) => product.get({ plain: true })),
        total: count,
      };
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByUserId(userId: string, status?: string, pagination?: { page?: number; limit?: number }): Promise<{ products: any[], total: number }> {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;

      const where: any = { userId };
      if (status) {
        where.status = status;
      }

      const { count, rows: products } = await Product.findAndCountAll({
        where,
        include: this.getProductIncludes(),
        raw: false,
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });

      return {
        products: products.map((product) => product.get({ plain: true })),
        total: count,
      };
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findBySubcategoryId(subcategoryId: string, pagination?: { page?: number; limit?: number }): Promise<{ products: any[], total: number }> {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;

      const { count, rows: products } = await Product.findAndCountAll({
        where: { subcategoryId },
        include: this.getProductIncludes(),
        raw: false,
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });

      return {
        products: products.map((product) => product.get({ plain: true })),
        total: count,
      };
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(status?: string, pagination?: { page?: number; limit?: number }): Promise<{ products: any[], total: number }> {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;

      const where: any = {};
      if (status) {
        where.status = status;
      }

      const { count, rows: products } = await Product.findAndCountAll({
        where,
        include: this.getProductIncludes(),
        raw: false,
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });

      return {
        products: products.map((product) => product.get({ plain: true })),
        total: count,
      };
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async update(updateData: IUpdateProduct): Promise<IProduct> {
    try {
      const product = await Product.findOne({
        where: { id: updateData.id },
        raw: false,
      });

      if (!product) {
        throw new HttpException(404, "Product not found");
      }

      const updatePayload: any = {};
      if (updateData.userId !== undefined) updatePayload.userId = updateData.userId;
      if (updateData.title !== undefined) updatePayload.title = updateData.title;
      if (updateData.description !== undefined) updatePayload.description = updateData.description;
      if (updateData.sku !== undefined) updatePayload.sku = updateData.sku;
      if (updateData.status !== undefined) updatePayload.status = updateData.status;
      if (updateData.images !== undefined) updatePayload.images = updateData.images;
      if (updateData.video !== undefined) updatePayload.video = updateData.video;

      // Handle technicalDetails updates
      if (updateData.technicalDetails) {
        if (updateData.technicalDetails.categoryId !== undefined) {
          updatePayload.categoryId = updateData.technicalDetails.categoryId;
        }
        if (updateData.technicalDetails.subcategoryId !== undefined) {
          updatePayload.subcategoryId = updateData.technicalDetails.subcategoryId;
        }
        if (updateData.technicalDetails.regularPrice !== undefined) {
          updatePayload.regularPrice = updateData.technicalDetails.regularPrice;
        }
        if (updateData.technicalDetails.discountPrice !== undefined) {
          updatePayload.discountPrice = updateData.technicalDetails.discountPrice;
        }
        if (updateData.technicalDetails.initialStock !== undefined) {
          updatePayload.initialStock = updateData.technicalDetails.initialStock;
        }
      }

      await product.update(updatePayload);

      // Handle variants update
      if (updateData.variants !== undefined) {
        // Get existing variants to delete their inventory
        const existingVariants = await ProductVariant.findAll({
          where: { productId: updateData.id },
          attributes: ["id"],
        });

        // Delete inventory for existing variants
        if (existingVariants.length > 0) {
          await Inventory.destroy({
            where: { productVariantId: existingVariants.map((v: any) => v.id) },
          });
        }

        // Delete existing variants
        await ProductVariant.destroy({
          where: { productId: updateData.id },
        });

        // Create new variants
        if (updateData.variants.length > 0) {
          const createdVariants = await ProductVariant.bulkCreate(
            updateData.variants.map((variant) => ({
              ...variant,
              productId: updateData.id,
            })) as any[]
          );

          // Create inventory records for new variants
          await Inventory.bulkCreate(
            createdVariants.map((variant: any) => ({
              productVariantId: variant.id,
              productId: null,
              quantityAvailable: variant.stock || 0,
              quantityReserved: 0,
              reorderLevel: 10,
            }))
          );
        }
      }

      // Handle inventory update for products without variants
      if (updateData.technicalDetails?.initialStock !== undefined) {
        const existingInventory = await Inventory.findOne({
          where: { productId: updateData.id },
        });

        if (existingInventory) {
          await existingInventory.update({
            quantityAvailable: updateData.technicalDetails.initialStock,
          });
        } else {
          // Create inventory if it doesn't exist
          await Inventory.create({
            productId: updateData.id,
            productVariantId: null,
            quantityAvailable: updateData.technicalDetails.initialStock,
            quantityReserved: 0,
            reorderLevel: 10,
          } as any);
        }
      }

      // Fetch updated product with variants
      const updatedProduct = await Product.findByPk(updateData.id, {
        include: this.getProductIncludes(),
        raw: false,
      });

      if (!updatedProduct) {
        throw new HttpException(404, "Product not found after update");
      }

      return updatedProduct.get({ plain: true });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(409, error.message);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const product = await Product.findOne({
        where: { id },
      });

      if (!product) {
        throw new HttpException(404, "Product not found");
      }

      await product.destroy();
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }
}
