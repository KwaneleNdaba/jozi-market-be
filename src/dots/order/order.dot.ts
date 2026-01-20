import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsEmail,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { OrderStatus, PaymentStatus } from "@/types/order.types";

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

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsNotEmpty()
  public shippingAddress: ShippingAddressDto;

  @IsString()
  @IsNotEmpty()
  public paymentMethod: string;

  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsOptional()
  @IsString()
  public phone?: string;

  @IsOptional()
  @IsString()
  public notes?: string;
}

export class UpdateOrderDto {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  public status?: OrderStatus | string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  public paymentStatus?: PaymentStatus | string;

  @IsOptional()
  @IsString()
  public notes?: string;
}
