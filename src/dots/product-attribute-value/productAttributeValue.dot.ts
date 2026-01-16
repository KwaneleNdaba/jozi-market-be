import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

class CreateProductAttributeValueItemDto {
  @IsString()
  @IsNotEmpty()
  public attributeId: string;

  @IsString()
  @IsNotEmpty()
  public value: string;
}

export class CreateProductAttributeValueDto {
  @IsString()
  @IsNotEmpty()
  public productId: string;

  @IsString()
  @IsNotEmpty()
  public attributeId: string;

  @IsString()
  @IsNotEmpty()
  public value: string;
}

export class CreateBulkProductAttributeValueDto {
  @IsString()
  @IsNotEmpty()
  public productId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductAttributeValueItemDto)
  public attributes: CreateProductAttributeValueItemDto[];
}

export class UpdateProductAttributeValueDto {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsOptional()
  @IsString()
  public productId?: string;

  @IsOptional()
  @IsString()
  public attributeId?: string;

  @IsOptional()
  @IsString()
  public value?: string;
}
