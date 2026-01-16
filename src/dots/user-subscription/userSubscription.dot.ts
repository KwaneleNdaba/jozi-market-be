import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from "class-validator";
import { UserSubscriptionStatus } from "@/types/subscription.types";

export class CreateUserSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  public userId: string;

  @IsString()
  @IsNotEmpty()
  public subscriptionPlanId: string;

  @IsDateString()
  @IsNotEmpty()
  public startDate: string;

  @IsDateString()
  @IsNotEmpty()
  public endDate: string;

  @IsOptional()
  @IsEnum(UserSubscriptionStatus)
  public status?: UserSubscriptionStatus | string;
}

export class UpdateUserSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsOptional()
  @IsString()
  public userId?: string;

  @IsOptional()
  @IsString()
  public subscriptionPlanId?: string;

  @IsOptional()
  @IsDateString()
  public startDate?: string;

  @IsOptional()
  @IsDateString()
  public endDate?: string;

  @IsOptional()
  @IsEnum(UserSubscriptionStatus)
  public status?: UserSubscriptionStatus | string;
}
