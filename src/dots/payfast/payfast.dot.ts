import { IsString, IsNotEmpty, IsEmail, IsOptional } from "class-validator";

export class GeneratePaymentDto {
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsOptional()
  @IsString()
  public phone?: string;

  @IsOptional()
  @IsString()
  public fullName?: string;

  @IsOptional()
  public deliveryAddress?: any;
}
