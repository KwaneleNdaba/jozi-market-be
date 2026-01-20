import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

class ShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  public street: string;

  @IsString()
  @IsNotEmpty()
  public city: string;

  @IsString()
  @IsNotEmpty()
  public postal: string;

  @IsString()
  @IsNotEmpty()
  public country: string;

  @IsOptional()
  @IsString()
  public province?: string;
}

export class AddToCartDto {
  @IsUUID()
  @IsNotEmpty()
  public productId: string;

  @IsOptional()
  @IsUUID()
  public productVariantId?: string | null;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  public quantity: number;
}

export class UpdateCartItemDto {
  @IsUUID()
  @IsNotEmpty()
  public id: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  public quantity: number;
}
