import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsArray,
  IsNumber,
} from "class-validator";

export class CreateCategoryAttributeDto {
  @IsString()
  @IsNotEmpty()
  public categoryId: string;

  @IsString()
  @IsNotEmpty()
  public attributeId: string;

  @IsOptional()
  @IsBoolean()
  public isRequired?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public options?: string[];

  @IsOptional()
  @IsNumber()
  public displayOrder?: number;
}

export class UpdateCategoryAttributeDto {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsOptional()
  @IsString()
  public categoryId?: string;

  @IsOptional()
  @IsString()
  public attributeId?: string;

  @IsOptional()
  @IsBoolean()
  public isRequired?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public options?: string[];

  @IsOptional()
  @IsNumber()
  public displayOrder?: number;
}
