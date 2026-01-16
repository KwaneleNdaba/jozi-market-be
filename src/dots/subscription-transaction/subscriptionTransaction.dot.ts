import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsDateString } from "class-validator";
import { SubscriptionTransactionType, SubscriptionTransactionStatus } from "@/types/subscription.types";

export class CreateSubscriptionTransactionDto {
  @IsString()
  @IsNotEmpty()
  public userId: string;

  @IsString()
  @IsNotEmpty()
  public subscriptionPlanId: string;

  @IsOptional()
  @IsString()
  public userSubscriptionId?: string | null;

  @IsNumber()
  @IsNotEmpty()
  public amount: number;

  @IsOptional()
  @IsString()
  public currency?: string;

  @IsEnum(SubscriptionTransactionType)
  @IsNotEmpty()
  public transactionType: SubscriptionTransactionType | string;

  @IsOptional()
  @IsEnum(SubscriptionTransactionStatus)
  public status?: SubscriptionTransactionStatus | string;

  @IsOptional()
  @IsString()
  public paymentProvider?: string | null;

  @IsOptional()
  @IsString()
  public providerReference?: string | null;

  @IsDateString()
  @IsNotEmpty()
  public startedAt: string;

  @IsOptional()
  @IsDateString()
  public endedAt?: string | null;
}

export class UpdateSubscriptionTransactionDto {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsOptional()
  @IsEnum(SubscriptionTransactionStatus)
  public status?: SubscriptionTransactionStatus | string;

  @IsOptional()
  @IsString()
  public providerReference?: string | null;

  @IsOptional()
  @IsDateString()
  public endedAt?: string | null;
}

export class SubscriptionPaymentRequestDto {
  @IsString()
  @IsNotEmpty()
  public userId: string;

  @IsString()
  @IsNotEmpty()
  public subscriptionPlanId: string;

  @IsString()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public fullName: string;

  @IsString()
  @IsNotEmpty()
  public phone: string;

  @IsOptional()
  @IsEnum(SubscriptionTransactionType)
  public transactionType?: SubscriptionTransactionType | string;
}
