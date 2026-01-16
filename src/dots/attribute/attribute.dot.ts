import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
} from "class-validator";
import { AttributeType } from "@/types/attribute.types";

export class CreateAttributeDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  public slug: string;

  @IsEnum(AttributeType)
  @IsNotEmpty()
  public type: AttributeType | string;

  @IsOptional()
  @IsString()
  public unit?: string;
}

export class UpdateAttributeDto {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsOptional()
  @IsString()
  public name?: string;

  @IsOptional()
  @IsString()
  public slug?: string;

  @IsOptional()
  @IsEnum(AttributeType)
  public type?: AttributeType | string;

  @IsOptional()
  @IsString()
  public unit?: string;
}
