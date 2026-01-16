import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateFeatureDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  public description: string;

  @IsString()
  @IsNotEmpty()
  public slug: string;
}

export class UpdateFeatureDto {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsOptional()
  @IsString()
  public name?: string;

  @IsOptional()
  @IsString()
  public description?: string;

  @IsOptional()
  @IsString()
  public slug?: string;
}
