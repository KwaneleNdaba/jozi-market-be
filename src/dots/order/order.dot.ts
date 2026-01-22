import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsEmail,
  ValidateNested,
  IsUUID,
} from "class-validator";
import { Type } from "class-transformer";
import { OrderStatus, PaymentStatus, ReturnRequestStatus, CancellationRequestStatus } from "@/types/order.types";

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

export class RequestReturnDto {
  @IsUUID()
  @IsNotEmpty()
  public orderId: string;

  @IsOptional()
  @IsString()
  public reason?: string;
}

export class RequestCancellationDto {
  @IsUUID()
  @IsNotEmpty()
  public orderId: string;

  @IsOptional()
  @IsString()
  public reason?: string;
}

export class ReviewReturnDto {
  @IsUUID()
  @IsNotEmpty()
  public orderId: string;

  @IsEnum(ReturnRequestStatus)
  @IsNotEmpty()
  public status: ReturnRequestStatus | string;

  @IsUUID()
  @IsNotEmpty()
  public reviewedBy: string;

  @IsOptional()
  @IsString()
  public rejectionReason?: string;
}

export class ReviewCancellationDto {
  @IsUUID()
  @IsNotEmpty()
  public orderId: string;

  @IsEnum(CancellationRequestStatus)
  @IsNotEmpty()
  public status: CancellationRequestStatus | string;

  @IsUUID()
  @IsNotEmpty()
  public reviewedBy: string;

  @IsOptional()
  @IsString()
  public rejectionReason?: string;
}

export class RequestItemReturnDto {
  @IsUUID()
  @IsNotEmpty()
  public orderId: string;

  @IsUUID()
  @IsNotEmpty()
  public orderItemId: string;

  @IsNotEmpty()
  public returnQuantity: number;

  @IsOptional()
  @IsString()
  public reason?: string;
}

export class ReviewItemReturnDto {
  @IsUUID()
  @IsNotEmpty()
  public orderId: string;

  @IsUUID()
  @IsNotEmpty()
  public orderItemId: string;

  @IsEnum(ReturnRequestStatus)
  @IsNotEmpty()
  public status: ReturnRequestStatus | string;

  @IsUUID()
  @IsNotEmpty()
  public reviewedBy: string;

  @IsOptional()
  @IsString()
  public rejectionReason?: string;
}
