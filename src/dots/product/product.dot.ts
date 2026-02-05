import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsObject,
} from "class-validator";
import { Type } from "class-transformer";
import { ProductStatus } from "@/types/product.types";

class ProductImageDto {
  @IsNumber()
  public index: number;

  @IsString()
  @IsNotEmpty()
  public file: string;
}

class ProductVideoDto {
  @IsString()
  @IsNotEmpty()
  public file: string;
}

class ProductAttributeDto {
  @IsString()
  @IsNotEmpty()
  public attributeId: string;

  @IsString()
  @IsNotEmpty()
  public value: string;
}

class TechnicalDetailsDto {
  @IsString()
  @IsNotEmpty()
  public categoryId: string;

  @IsOptional()
  @IsString()
  public subcategoryId?: string;

  @IsNumber()
  @IsOptional()
  public regularPrice: number;

  @IsOptional()
  @IsNumber()
  public discountPrice?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeDto)
  public attributes?: ProductAttributeDto[];
}

class ProductVariantDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  public sku: string;

  @IsOptional()
  @IsNumber()
  public price?: number; // Optional: Uses product regularPrice if not set

  @IsOptional()
  @IsNumber()
  public discountPrice?: number;

  @IsNumber()
  @IsNotEmpty()
  public stock: number;

  @IsEnum(ProductStatus)
  @IsNotEmpty()
  public status: ProductStatus | string;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  public title: string;

  @IsString()
  @IsNotEmpty()
  public description: string;

  @IsString()
  @IsNotEmpty()
  public sku: string;

  @IsEnum(ProductStatus)
  @IsNotEmpty()
  public status: ProductStatus | string;

  @ValidateNested()
  @Type(() => TechnicalDetailsDto)
  public technicalDetails: TechnicalDetailsDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  public images: ProductImageDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductVideoDto)
  public video?: ProductVideoDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  public variants?: ProductVariantDto[];
}

export class UpdateProductDto {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsOptional()
  @IsString()
  public userId?: string;

  @IsOptional()
  @IsString()
  public title?: string;

  @IsOptional()
  @IsString()
  public description?: string;

  @IsOptional()
  @IsString()
  public sku?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  public status?: ProductStatus | string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TechnicalDetailsDto)
  public technicalDetails?: TechnicalDetailsDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  public images?: ProductImageDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductVideoDto)
  public video?: ProductVideoDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  public variants?: ProductVariantDto[];
}
