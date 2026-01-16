import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  public password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(10)
  public role: string;

  @IsOptional()
  @IsString()
  @MaxLength(6)
  public otp?: string;

  @IsOptional()
  @IsBoolean()
  public isAccountBlocked?: boolean;

  @IsOptional()
  @IsBoolean()
  public canReview?: boolean;
}
