import { Inject, Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { type ICategoryRepository, CATEGORY_REPOSITORY_TOKEN } from "@/interfaces/category/ICategoryRepository.interface";
import { type ICategoryService, CATEGORY_SERVICE_TOKEN } from "@/interfaces/category/ICategoryService.interface";
import type { ICategory, ICreateCategory, IUpdateCategory } from "@/types/category.types";
import { getDownloadSignedUrl } from "@/utils/s3";
import { logger } from "@/utils/logger";

@Service({ id: CATEGORY_SERVICE_TOKEN })
export class CategoryService implements ICategoryService {
  constructor(@Inject(CATEGORY_REPOSITORY_TOKEN) private readonly categoryRepository: ICategoryRepository) {}

  public async createCategory(categoryData: ICreateCategory): Promise<ICategory> {
    try {
      // Create main category
      const mainCategory = await this.categoryRepository.create({
        name: categoryData.name,
        description: categoryData.description,
        status: categoryData.status,
        icon: categoryData.icon,
        categoryId: null, // Top-level category
      });

      // Create subcategories if provided
      if (categoryData.subcategories && categoryData.subcategories.length > 0) {
        const subcategoryPromises = categoryData.subcategories.map((subcategory) =>
          this.categoryRepository.create({
            name: subcategory.name,
            description: subcategory.description,
            status: subcategory.status,
            categoryId: mainCategory.id!, // Link to parent category
          })
        );

        await Promise.all(subcategoryPromises);
      }

      // Return the main category (subcategories can be fetched separately)
      return mainCategory;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  private async enrichWithSignedUrl(category: ICategory): Promise<ICategory> {
    if (!category.icon) {
      return category;
    }

    try {
      const iconUrl = category.icon;
      
      // Extract S3 key from URL or use as-is if it's already a key
      let s3Key: string;
      
      if (iconUrl.startsWith('http://') || iconUrl.startsWith('https://')) {
        // Extract key from full S3 URL
        // Format: https://bucket.s3.region.amazonaws.com/jozi-makert-files/filename
        const urlParts = iconUrl.split('/');
        const keyIndex = urlParts.findIndex(part => part === 'jozi-makert-files');
        if (keyIndex !== -1) {
          s3Key = urlParts.slice(keyIndex).join('/');
        } else {
          // Fallback: use filename from URL
          s3Key = `jozi-makert-files/${urlParts[urlParts.length - 1]}`;
        }
      } else if (iconUrl.startsWith('jozi-makert-files/')) {
        // Already a key
        s3Key = iconUrl;
      } else {
        // Just a filename, construct the key
        s3Key = `jozi-makert-files/${iconUrl}`;
      }
      
      // Generate signed URL (expires in 1 hour)
      const signedUrl = await getDownloadSignedUrl(s3Key, undefined, 3600);
      
      return {
        ...category,
        icon: signedUrl,
      };
    } catch (error) {
      // If signed URL generation fails, keep original URL
      logger.error(`Failed to generate signed URL for category icon ${category.id}:`, error);
      return category;
    }
  }

  private async enrichCategoryWithSubcategories(category: ICategory): Promise<ICategory> {
    // Enrich main category icon
    const enrichedCategory = await this.enrichWithSignedUrl(category);
    
    // Enrich subcategories if they exist
    if (category.subcategories && category.subcategories.length > 0) {
      const enrichedSubcategories = await Promise.all(
        category.subcategories.map(sub => this.enrichWithSignedUrl(sub))
      );
      
      return {
        ...enrichedCategory,
        subcategories: enrichedSubcategories,
      };
    }
    
    return enrichedCategory;
  }

  public async getCategoryById(id: string): Promise<ICategory | null> {
    try {
      const category = await this.categoryRepository.findById(id);
      if (!category) {
        return null;
      }
      return await this.enrichWithSignedUrl(category);
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getSubcategoriesByCategoryId(categoryId: string): Promise<ICategory[]> {
    try {
      const subcategories = await this.categoryRepository.findByCategoryId(categoryId);
      // Enrich all subcategories with signed URLs
      return await Promise.all(subcategories.map(sub => this.enrichWithSignedUrl(sub)));
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async getAllCategories(status?: string): Promise<ICategory[]> {
    try {
      const categories = await this.categoryRepository.findAllWithSubcategories(status);
      // Enrich all categories and their subcategories with signed URLs
      return await Promise.all(categories.map(cat => this.enrichCategoryWithSubcategories(cat)));
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }

  public async updateCategory(updateData: IUpdateCategory): Promise<ICategory> {
    try {
      const category = await this.categoryRepository.findById(updateData.id);
      if (!category) {
        throw new HttpException(404, "Category not found");
      }

      // Update main category
      const updatedCategory = await this.categoryRepository.update(updateData);

      // Create subcategories if provided
      if (updateData.subcategories && updateData.subcategories.length > 0) {
        const subcategoryPromises = updateData.subcategories.map((subcategory) =>
          this.categoryRepository.create({
            name: subcategory.name,
            description: subcategory.description,
            status: subcategory.status,
            categoryId: updateData.id, // Link to parent category
          })
        );

        await Promise.all(subcategoryPromises);
      }

      // Fetch subcategories for the updated category
      const subcategories = await this.categoryRepository.findByCategoryId(updateData.id);
      const categoryWithSubcategories: ICategory = {
        ...updatedCategory,
        subcategories,
      };

      return await this.enrichCategoryWithSubcategories(categoryWithSubcategories);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }

  public async deleteCategory(id: string): Promise<void> {
    try {
      const category = await this.categoryRepository.findById(id);
      if (!category) {
        throw new HttpException(404, "Category not found");
      }

      // Check if category has subcategories
      const subcategories = await this.categoryRepository.findByCategoryId(id);
      if (subcategories.length > 0) {
        throw new HttpException(400, "Cannot delete category with subcategories. Please delete subcategories first.");
      }

      await this.categoryRepository.delete(id);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }
}
