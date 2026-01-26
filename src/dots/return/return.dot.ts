import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  Min,
  ValidateNested,
  IsArray,
  ArrayMinSize,
} from "class-validator";
import { Type } from "class-transformer";
import { ReturnStatus } from "@/types/return.types";

class ReturnItemDto {
  @IsUUID()
  @IsNotEmpty()
  public orderItemId: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  public quantity: number;

  @IsOptional()
  @IsString()
  public reason?: string;
}

export class CreateReturnDto {
  @IsUUID()
  @IsNotEmpty()
  public orderId: string;

  @IsString()
  @IsNotEmpty()
  public reason: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  @IsNotEmpty()
  public items: ReturnItemDto[];
}

export class ReviewReturnDto {
  @IsUUID()
  @IsNotEmpty()
  public returnId: string;

  @IsEnum(ReturnStatus)
  @IsNotEmpty()
  public status: ReturnStatus;

  @IsUUID()
  @IsNotEmpty()
  public reviewedBy: string;

  @IsOptional()
  @IsString()
  public rejectionReason?: string;
}

export class ReviewReturnItemDto {
  @IsUUID()
  @IsNotEmpty()
  public returnItemId: string;

  @IsEnum(ReturnStatus)
  @IsNotEmpty()
  public status: ReturnStatus;

  @IsUUID()
  @IsNotEmpty()
  public reviewedBy: string;

  @IsOptional()
  @IsString()
  public rejectionReason?: string;
}

export class UpdateReturnStatusDto {
  @IsEnum(ReturnStatus)
  @IsNotEmpty()
  public status: ReturnStatus;
}

export class UpdateReturnItemStatusDto {
  @IsEnum(ReturnStatus)
  @IsNotEmpty()
  public status: ReturnStatus;
}
