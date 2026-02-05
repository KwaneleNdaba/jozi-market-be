import { Inject, Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { type IProductRepository, PRODUCT_REPOSITORY_TOKEN } from "@/interfaces/product/IProductRepository.interface";
import { type IProductService, PRODUCT_SERVICE_TOKEN } from "@/interfaces/product/IProductService.interface";
import { PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN } from "@/interfaces/product-attribute-value/IProductAttributeValueRepository.interface";
import type { IProduct, ICreateProduct, IUpdateProduct, ITechnicalDetails, IProductImage, IProductVideo, IPaginatedResponse, IPaginationParams } from "@/types/product.types";
import { getDownloadSignedUrl } from "@/utils/s3";
import { logger } from "@/utils/logger";

@Service({ id: PRODUCT_SERVICE_TOKEN })
export class ProductService implements IProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY_TOKEN) private readonly productRepository: IProductRepository,
    @Inject(PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN) private readonly productAttributeValueRepository: any
  ) {}

  private extractS3Key(fileUrl: string): string {
    // Extract S3 key from URL or use as-is if it's already a key
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      // Check if it's a pre-signed URL (contains query parameters)
      const urlWithoutQuery = fileUrl.split('?')[0];
      
      // Extract key from full S3 URL
      // Format: https://bucket.s3.region.amazonaws.com/jozi-makert-files/filename
      const urlParts = urlWithoutQuery.split('/');
      const keyIndex = urlParts.findIndex(part => part === 'jozi-makert-files');
      if (keyIndex !== -1) {
        return urlParts.slice(keyIndex).join('/');
      } else {
        // Fallback: use filename from URL
        return `jozi-makert-files/${urlParts[urlParts.length - 1]}`;
      }
    } else if (fileUrl.startsWith('jozi-makert-files/')) {
      // Already a key
      return fileUrl;
    } else {
      // Just a filename, construct the key
      return `jozi-makert-files/${fileUrl}`;
    }
  }

  private normalizeProductData(productData: ICreateProduct | IUpdateProduct): ICreateProduct | IUpdateProduct {
    const normalized = { ...productData };

    // Normalize images - extract S3 keys from pre-signed URLs
    if (normalized.images && Array.isArray(normalized.images)) {
      normalized.images = normalized.images.map((image) => ({
        ...image,
        file: this.extractS3Key(image.file),
      }));
    }

    // Normalize video - extract S3 key from pre-signed URL
    if (normalized.video && normalized.video.file) {
      normalized.video = {
        ...normalized.video,
        file: this.extractS3Key(normalized.video.file),
      };
    }

    return normalized;
  }

  private async enrichWithSignedUrls(product: IProduct): Promise<IProduct> {
    const enrichedProduct = { ...product };

    // Enrich images with signed URLs
    if (enrichedProduct.images && Array.isArray(enrichedProduct.images)) {
      const enrichedImages: IProductImage[] = await Promise.all(
        enrichedProduct.images.map(async (image) => {
          if (image.file) {
            try {
              const s3Key = this.extractS3Key(image.file);
              const signedUrl = await getDownloadSignedUrl(s3Key, undefined, 3600);
              return {
                ...image,
                file: signedUrl,
              };
            } catch (error) {
              // If signed URL generation fails, keep original URL
              logger.error(`Failed to generate signed URL for product image:`, error);
              return image;
            }
          }
          return image;
        })
      );
      enrichedProduct.images = enrichedImages;
    }

    // Enrich video with signed URL if it exists
    if (enrichedProduct.video && enrichedProduct.video.file) {
      try {
        const s3Key = this.extractS3Key(enrichedProduct.video.file);
        const signedUrl = await getDownloadSignedUrl(s3Key, undefined, 3600);
        enrichedProduct.video = {
          ...enrichedProduct.video,
          file: signedUrl,
        };
      } catch (error) {
        // If signed URL generation fails, keep original URL
        logger.error(`Failed to generate signed URL for product video:`, error);
      }
    }

    // Enrich vendor logo with signed URL if it exists
    if (enrichedProduct.vendorLogo) {
      try {
        const s3Key = this.extractS3Key(enrichedProduct.vendorLogo);
        const signedUrl = await getDownloadSignedUrl(s3Key, undefined, 3600);
        enrichedProduct.vendorLogo = signedUrl;
      } catch (error) {
        // If signed URL generation fails, keep original URL
        logger.error(`Failed to generate signed URL for vendor logo:`, error);
      }
    }

    return enrichedProduct;
  }

  private async enrichProductWithAttributes(product: any): Promise<IProduct> {
    // Fetch product attribute values
    const attributeValues = await this.productAttributeValueRepository.findByProductId(product.id);

    // Extract vendor name, description, and logo from nested structure
    let vendorName: string | undefined = undefined;
    let vendorDescription: string | undefined = undefined;
    let vendorLogo: string | undefined = undefined;
    
    if (product.vendor && product.vendor.applicant) {
      let selectedApplication: any = null;
      
      if (Array.isArray(product.vendor.applicant) && product.vendor.applicant.length > 0) {
        // Get the most recent approved application, or the most recent one if none approved
        const approvedApplication = product.vendor.applicant.find((app: any) => app.status === "approved");
        if (approvedApplication) {
          selectedApplication = approvedApplication;
        } else if (product.vendor.applicant.length > 0) {
          // Fallback to most recent application if no approved one exists
          selectedApplication = product.vendor.applicant[0];
        }
      } else if (product.vendor.applicant) {
        // If it's a single object (not array)
        selectedApplication = product.vendor.applicant;
      }
      
      if (selectedApplication) {
        vendorName = selectedApplication.shopName;
        vendorDescription = selectedApplication.description;
        
        // Extract logo from files object
        if (selectedApplication.files && selectedApplication.files.logoUrl) {
          vendorLogo = selectedApplication.files.logoUrl;
        }
      }
    }

    // Process variants with inventory data
    const variants = (product.variants || []).map((variant: any) => {
      const variantData: any = {
        id: variant.id,
        productId: variant.productId,
        name: variant.name,
        sku: variant.sku,
        // Use variant price if set, otherwise use product regularPrice
        price: variant.price !== null && variant.price !== undefined 
          ? parseFloat(variant.price) 
          : parseFloat(product.regularPrice),
        discountPrice: variant.discountPrice ? parseFloat(variant.discountPrice) : undefined,
        stock: variant.stock || 0,
        status: variant.status,
        createdAt: variant.createdAt,
        updatedAt: variant.updatedAt,
      };

      // Add actual inventory data if available
      if (variant.inventory) {
        variantData.inventory = {
          quantityAvailable: variant.inventory.quantityAvailable,
          quantityReserved: variant.inventory.quantityReserved,
          reorderLevel: variant.inventory.reorderLevel,
        };
        // Update stock with actual available quantity
        variantData.stock = variant.inventory.quantityAvailable;
      }

      return variantData;
    });

    // Get product inventory data for products without variants
    let productStock = product.initialStock !== null && product.initialStock !== undefined ? product.initialStock : undefined;
    let productInventory: any = undefined;
    
    if (product.inventory) {
      productStock = product.inventory.quantityAvailable;
      productInventory = {
        quantityAvailable: product.inventory.quantityAvailable,
        quantityReserved: product.inventory.quantityReserved,
        reorderLevel: product.inventory.reorderLevel,
      };
    }

    // Reconstruct technicalDetails with attributes
    const technicalDetails: ITechnicalDetails = {
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId || undefined,
      regularPrice: parseFloat(product.regularPrice),
      discountPrice: product.discountPrice ? parseFloat(product.discountPrice) : undefined,
      initialStock: productStock,
      attributes: attributeValues.map((av: any) => ({
        attributeId: av.attributeId,
        value: av.value,
      })),
    };

    // Reconstruct product with proper structure
    const enrichedProduct: IProduct = {
      id: product.id,
      userId: product.userId,
      title: product.title,
      description: product.description,
      sku: product.sku,
      status: product.status,
      technicalDetails,
      images: product.images || [],
      video: product.video || undefined,
      variants,
      inventory: productInventory, // Include inventory data for products without variants
      vendorName,
      vendorDescription,
      vendorLogo,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    // Enrich with signed URLs for images, video, and vendor logo
    return await this.enrichWithSignedUrls(enrichedProduct);
  }

  private createPaginationResponse<T>(data: T[], total: number, page: number, limit: number): IPaginatedResponse<T> {
    const totalPages = Math.ceil(total / limit);
    
    return {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  public async createProduct(productData: ICreateProduct): Promise<IProduct> {
    try {
      // Check if SKU already exists
      const existingProduct = await this.productRepository.findBySku(productData.sku);
      if (existingProduct) {
        throw new HttpException(409, "A product with this SKU already exists");
      }

      // Normalize product data - extract S3 keys from pre-signed URLs
      const normalizedData = this.normalizeProductData(productData) as ICreateProduct;

      // Create product (variants will be created by repository)
      const createdProduct = await this.productRepository.create(normalizedData);

      // Create product attribute values if provided
      if (productData.technicalDetails.attributes && productData.technicalDetails.attributes.length > 0) {
        await this.productAttributeValueRepository.createBulk(
          productData.technicalDetails.attributes.map((attr) => ({
            productId: createdProduct.id,
            attributeId: attr.attributeId,
            value: attr.value,
          }))
        );
      }

      // Fetch and enrich with attributes
      const product = await this.productRepository.findById(createdProduct.id);
      if (!product) {
        throw new HttpException(500, "Failed to retrieve created product");
      }

      return await this.enrichProductWithAttributes(product);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async getProductById(id: string): Promise<IProduct | null> {
    try {
      const product = await this.productRepository.findById(id);
      if (!product) {
        return null;
      }

      return await this.enrichProductWithAttributes(product);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getProductBySku(sku: string): Promise<IProduct | null> {
    try {
      const product = await this.productRepository.findBySku(sku);
      if (!product) {
        return null;
      }

      return await this.enrichProductWithAttributes(product);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getProductsByCategoryId(categoryId: string, pagination?: IPaginationParams): Promise<IPaginatedResponse<IProduct>> {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      
      const { products, total } = await this.productRepository.findByCategoryId(categoryId, { page, limit });
      const enrichedProducts = await Promise.all(products.map((product) => this.enrichProductWithAttributes(product)));
      
      return this.createPaginationResponse(enrichedProducts, total, page, limit);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getProductsByUserId(userId: string, status?: string, pagination?: IPaginationParams): Promise<IPaginatedResponse<IProduct>> {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      
      const { products, total } = await this.productRepository.findByUserId(userId, status, { page, limit });
      const enrichedProducts = await Promise.all(products.map((product) => this.enrichProductWithAttributes(product)));
      
      return this.createPaginationResponse(enrichedProducts, total, page, limit);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getProductsBySubcategoryId(subcategoryId: string, pagination?: IPaginationParams): Promise<IPaginatedResponse<IProduct>> {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      
      const { products, total } = await this.productRepository.findBySubcategoryId(subcategoryId, { page, limit });
      const enrichedProducts = await Promise.all(products.map((product) => this.enrichProductWithAttributes(product)));
      
      return this.createPaginationResponse(enrichedProducts, total, page, limit);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getAllProducts(status?: string, pagination?: IPaginationParams): Promise<IPaginatedResponse<IProduct>> {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      
      const { products, total } = await this.productRepository.findAll(status, { page, limit });
      const enrichedProducts = await Promise.all(products.map((product) => this.enrichProductWithAttributes(product)));
      
      return this.createPaginationResponse(enrichedProducts, total, page, limit);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async updateProduct(updateData: IUpdateProduct): Promise<IProduct> {
    try {
      const product = await this.productRepository.findById(updateData.id);
      if (!product) {
        throw new HttpException(404, "Product not found");
      }

      // Check SKU uniqueness if being updated
      if (updateData.sku && updateData.sku !== product.sku) {
        const existingProduct = await this.productRepository.findBySku(updateData.sku);
        if (existingProduct) {
          throw new HttpException(409, "A product with this SKU already exists");
        }
      }

      // Normalize product data - extract S3 keys from pre-signed URLs
      const normalizedUpdateData = this.normalizeProductData(updateData) as IUpdateProduct;

      // Update product attributes if provided
      if (normalizedUpdateData.technicalDetails?.attributes !== undefined) {
        // Delete existing attribute values
        await this.productAttributeValueRepository.deleteByProductId(updateData.id);

        // Create new attribute values
        if (normalizedUpdateData.technicalDetails.attributes.length > 0) {
          await this.productAttributeValueRepository.createBulk(
            normalizedUpdateData.technicalDetails.attributes.map((attr) => ({
              productId: updateData.id,
              attributeId: attr.attributeId,
              value: attr.value,
            }))
          );
        }
      }

      // Update product
      const updatedProduct = await this.productRepository.update(normalizedUpdateData);

      // Enrich with attributes
      return await this.enrichProductWithAttributes(updatedProduct);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async deleteProduct(id: string): Promise<void> {
    try {
      const product = await this.productRepository.findById(id);
      if (!product) {
        throw new HttpException(404, "Product not found");
      }

      // Delete product attribute values
      await this.productAttributeValueRepository.deleteByProductId(id);

      // Delete product (variants will be cascade deleted)
      await this.productRepository.delete(id);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }
}
