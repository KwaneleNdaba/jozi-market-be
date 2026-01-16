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

class ArtisanNotesDto {
  @IsString()
  @IsNotEmpty()
  public hook: string;

  @IsString()
  @IsNotEmpty()
  public story: string;

  @IsArray()
  @IsString({ each: true })
  public notes: string[];
}

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
  @IsNotEmpty()
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

  @IsNumber()
  @IsNotEmpty()
  public price: number;

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
  @Type(() => ArtisanNotesDto)
  public artisanNotes: ArtisanNotesDto;

  @ValidateNested()
  @Type(() => TechnicalDetailsDto)
  public technicalDetails: TechnicalDetailsDto;

  @IsString()
  @IsNotEmpty()
  public careGuidelines: string;

  @IsString()
  @IsNotEmpty()
  public packagingNarrative: string;

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
  @Type(() => ArtisanNotesDto)
  public artisanNotes?: ArtisanNotesDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TechnicalDetailsDto)
  public technicalDetails?: TechnicalDetailsDto;

  @IsOptional()
  @IsString()
  public careGuidelines?: string;

  @IsOptional()
  @IsString()
  public packagingNarrative?: string;

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
