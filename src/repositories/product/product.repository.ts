import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  type IProductRepository,
  PRODUCT_REPOSITORY_TOKEN,
} from "@/interfaces/product/IProductRepository.interface";
import Product from "@/models/product/product.model";
import ProductVariant from "@/models/product-variant/productVariant.model";
import type { IProduct, ICreateProduct, IUpdateProduct } from "@/types/product.types";

@Service({ id: PRODUCT_REPOSITORY_TOKEN })
export class ProductRepository implements IProductRepository {
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
        artisanNotes: productFields.artisanNotes,
        categoryId: technicalDetails.categoryId,
        subcategoryId: technicalDetails.subcategoryId || null,
        regularPrice: technicalDetails.regularPrice,
        discountPrice: technicalDetails.discountPrice || null,
        careGuidelines: productFields.careGuidelines,
        packagingNarrative: productFields.packagingNarrative,
        images: productFields.images,
        video: productFields.video || null,
      };

      const createdProduct = await Product.create(dbProductData as any, {
        raw: false,
      });

      // Create variants if provided
      if (variants && variants.length > 0) {
        await ProductVariant.bulkCreate(
          variants.map((variant) => ({
            ...variant,
            productId: createdProduct.id,
          })) as any[]
        );
      }

      return createdProduct.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(id: string): Promise<any> {
    try {
      const product = await Product.findByPk(id, {
        include: [
          {
            model: ProductVariant,
            as: "variants",
            required: false,
          },
        ],
        raw: false,
      });

      if (!product) {
        return null;
      }

      const productData = product.get({ plain: true });
      // Return flat structure - service will reconstruct technicalDetails with attributes
      return productData;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findBySku(sku: string): Promise<any> {
    try {
      const product = await Product.findOne({
        where: { sku },
        include: [
          {
            model: ProductVariant,
            as: "variants",
            required: false,
          },
        ],
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

  public async findByCategoryId(categoryId: string): Promise<any[]> {
    try {
      const products = await Product.findAll({
        where: { categoryId },
        include: [
          {
            model: ProductVariant,
            as: "variants",
            required: false,
          },
        ],
        raw: false,
        order: [["createdAt", "DESC"]],
      });

      return products.map((product) => product.get({ plain: true }));
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findByUserId(userId: string, status?: string): Promise<any[]> {
    try {
      const where: any = { userId };
      if (status) {
        where.status = status;
      }

      const products = await Product.findAll({
        where,
        include: [
          {
            model: ProductVariant,
            as: "variants",
            required: false,
          },
        ],
        raw: false,
        order: [["createdAt", "DESC"]],
      });

      return products.map((product) => product.get({ plain: true }));
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findBySubcategoryId(subcategoryId: string): Promise<any[]> {
    try {
      const products = await Product.findAll({
        where: { subcategoryId },
        include: [
          {
            model: ProductVariant,
            as: "variants",
            required: false,
          },
        ],
        raw: false,
        order: [["createdAt", "DESC"]],
      });

      return products.map((product) => product.get({ plain: true }));
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(status?: string): Promise<any[]> {
    try {
      const where: any = {};
      if (status) {
        where.status = status;
      }

      const products = await Product.findAll({
        where,
        include: [
          {
            model: ProductVariant,
            as: "variants",
            required: false,
          },
        ],
        raw: false,
        order: [["createdAt", "DESC"]],
      });

      return products.map((product) => product.get({ plain: true }));
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
      if (updateData.artisanNotes !== undefined) updatePayload.artisanNotes = updateData.artisanNotes;
      if (updateData.careGuidelines !== undefined) updatePayload.careGuidelines = updateData.careGuidelines;
      if (updateData.packagingNarrative !== undefined) updatePayload.packagingNarrative = updateData.packagingNarrative;
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
      }

      await product.update(updatePayload);

      // Handle variants update
      if (updateData.variants !== undefined) {
        // Delete existing variants
        await ProductVariant.destroy({
          where: { productId: updateData.id },
        });

        // Create new variants
        if (updateData.variants.length > 0) {
          await ProductVariant.bulkCreate(
            updateData.variants.map((variant) => ({
              ...variant,
              productId: updateData.id,
            })) as any[]
          );
        }
      }

      // Fetch updated product with variants
      const updatedProduct = await Product.findByPk(updateData.id, {
        include: [
          {
            model: ProductVariant,
            as: "variants",
            required: false,
          },
        ],
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
