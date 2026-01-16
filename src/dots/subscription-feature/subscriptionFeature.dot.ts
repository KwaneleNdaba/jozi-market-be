import { IsString, IsNotEmpty, IsOptional, IsBoolean } from "class-validator";

export class CreateSubscriptionFeatureDto {
  @IsString()
  @IsNotEmpty()
  public subscriptionPlanId: string;

  @IsString()
  @IsNotEmpty()
  public featureId: string;

  @IsOptional()
  @IsBoolean()
  public isIncluded?: boolean;
}

export class UpdateSubscriptionFeatureDto {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsOptional()
  @IsString()
  public subscriptionPlanId?: string;

  @IsOptional()
  @IsString()
  public featureId?: string;

  @IsOptional()
  @IsBoolean()
  public isIncluded?: boolean;
}
