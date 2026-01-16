import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsBoolean } from "class-validator";
import { SubscriptionPlanStatus, SubscriptionDuration } from "@/types/subscription.types";

export class CreateSubscriptionPlanDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  public subtitle: string;

  @IsString()
  @IsNotEmpty()
  public description: string;

  @IsNumber()
  @IsNotEmpty()
  public price: number;

  @IsEnum(SubscriptionDuration)
  @IsNotEmpty()
  public duration: SubscriptionDuration | string;

  @IsOptional()
  @IsEnum(SubscriptionPlanStatus)
  public status?: SubscriptionPlanStatus | string;

  @IsOptional()
  @IsBoolean()
  public isDark?: boolean;

  @IsOptional()
  @IsBoolean()
  public isStar?: boolean;
}

export class UpdateSubscriptionPlanDto {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsOptional()
  @IsString()
  public name?: string;

  @IsOptional()
  @IsString()
  public subtitle?: string;

  @IsOptional()
  @IsString()
  public description?: string;

  @IsOptional()
  @IsNumber()
  public price?: number;

  @IsOptional()
  @IsEnum(SubscriptionDuration)
  public duration?: SubscriptionDuration | string;

  @IsOptional()
  @IsEnum(SubscriptionPlanStatus)
  public status?: SubscriptionPlanStatus | string;

  @IsOptional()
  @IsBoolean()
  public isDark?: boolean;

  @IsOptional()
  @IsBoolean()
  public isStar?: boolean;
}
