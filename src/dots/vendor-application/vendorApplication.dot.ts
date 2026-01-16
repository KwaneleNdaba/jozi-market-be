import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { VendorApplicationStatus, VendorType } from "@/types/vendor.types";

class VendorAddressDto {
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
}

class VendorFilesDto {
  @IsOptional()
  @IsString()
  public logoUrl?: string;

  @IsOptional()
  @IsString()
  public bannerUrl?: string;

  @IsOptional()
  @IsString()
  public idDocUrl?: string;

  @IsOptional()
  @IsString()
  public bankProofUrl?: string;

  @IsOptional()
  @IsString()
  public addressProofUrl?: string;

  @IsOptional()
  @IsString()
  public cipcDocUrl?: string;
}

class VendorAgreementsDto {
  @IsBoolean()
  @IsNotEmpty()
  public terms: boolean;

  @IsBoolean()
  @IsNotEmpty()
  public privacy: boolean;

  @IsBoolean()
  @IsNotEmpty()
  public popia: boolean;

  @IsBoolean()
  @IsNotEmpty()
  public policies: boolean;
}

export class CreateVendorApplicationDto {
  @IsOptional()
  public userId?: string | null;

  @IsEnum(VendorType)
  @IsNotEmpty()
  public vendorType: VendorType | string;

  @IsString()
  @IsNotEmpty()
  public legalName: string;

  @IsString()
  @IsNotEmpty()
  public shopName: string;

  @IsString()
  @IsNotEmpty()
  public contactPerson: string;

  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public phone: string;

  @IsString()
  @IsNotEmpty()
  public description: string;

  @IsOptional()
  @IsString()
  public website?: string;

  @IsOptional()
  @IsString()
  public tagline?: string;

  @IsOptional()
  @IsString()
  public cipcNumber?: string | null;

  @IsOptional()
  @IsString()
  public vatNumber?: string;

  @IsString()
  @IsNotEmpty()
  public productCount: string;

  @IsString()
  @IsNotEmpty()
  public fulfillment: string;

  @ValidateNested()
  @Type(() => VendorAddressDto)
  @IsNotEmpty()
  public address: VendorAddressDto;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  public deliveryRegions: string[];

  @ValidateNested()
  @Type(() => VendorFilesDto)
  @IsNotEmpty()
  public files: VendorFilesDto;

  @ValidateNested()
  @Type(() => VendorAgreementsDto)
  @IsNotEmpty()
  public agreements: VendorAgreementsDto;
}

export class UpdateVendorApplicationStatusDto {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsEnum(VendorApplicationStatus)
  @IsNotEmpty()
  public status: VendorApplicationStatus | string;

  @IsString()
  @IsNotEmpty()
  public reviewedBy: string;

  @IsOptional()
  @IsString()
  public rejectionReason?: string | null;
}
