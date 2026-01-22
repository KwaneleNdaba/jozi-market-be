import type { Request } from "express";

export enum Role {
  ADMIN = "admin",
  INFLUENCER = "influencer",
  CUSTOMER = "customer",
  VENDOR = "vendor",
}

export type TokenData = {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
};

export interface RequestWithUser extends Request {
  user: DataStoreInToken;
}

export interface IUser {
  id?: string;
  email: string;
  password: string;
  role: Role | string;
  fullName: string;
  isAccountBlocked: boolean;
  canReview: boolean;
  phone: string;
  isPhoneConfirmed: boolean;
  isStoreActive: boolean;
  profileUrl?: string;
  address?: string;
  provider_type?: string;
  provider_user_id?: string;
  otp?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUpdatePassword {
  userId: string;
  oldPassword: string;
  newPassword: string;
}

export interface DataStoreInToken {
  id: string;
  email: string;
  role: Role | string;
  isAccountBlocked: boolean;
  canReview: boolean;
  fullName: string;
  phone: string;
  isPhoneConfirmed: boolean;
  profileUrl?: string;
  address?: string;
  provider_type?: string;
  provider_user_id?: string;
}
export type IUserLogin = {
  email: string;
  password: string;
};

export interface IVendorWithApplication extends IUser {
  vendorApplication?: import("./vendor.types").IVendorApplication;
  productCount?: number;
}
