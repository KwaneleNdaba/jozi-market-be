import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { CategoryStatus } from "@/types/category.types";

class CreateSubcategoryDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  public description: string;

  @IsEnum(CategoryStatus)
  @IsNotEmpty()
  public status: CategoryStatus | string;
}

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  public description: string;

  @IsEnum(CategoryStatus)
  @IsNotEmpty()
  public status: CategoryStatus | string;

  @IsOptional()
  @IsString()
  public icon?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubcategoryDto)
  public subcategories?: CreateSubcategoryDto[];
}

export class UpdateCategoryDto {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsOptional()
  @IsString()
  public name?: string;

  @IsOptional()
  @IsString()
  public description?: string;

  @IsOptional()
  @IsEnum(CategoryStatus)
  public status?: CategoryStatus | string;

  @IsOptional()
  @IsString()
  public icon?: string;

  @IsOptional()
  @IsString()
  public categoryId?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubcategoryDto)
  public subcategories?: CreateSubcategoryDto[];
}
