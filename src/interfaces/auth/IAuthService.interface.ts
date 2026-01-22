import { Token } from "typedi";
import type { IUpdatePassword, IUser, TokenData, IVendorWithApplication } from "@/types/auth.types";

export interface IAuthService {
  signup(userData: IUser): Promise<TokenData>;
  login(userData: IUser): Promise<TokenData>;
  refreshToken(token: string): Promise<TokenData>;
  logout(token: string): Promise<void>;
  updateUser(userData: Partial<IUser>): Promise<TokenData>;
  sendOtp(email: string): Promise<string>;
  verifyOtp(email: string, otp: string): Promise<string>;
  resetPassword(email: string, otp: string, newPassword: string): Promise<IUser>;
  blockUserAccount(userId: string): Promise<IUser>;
  unblockUserAccount(userId: string): Promise<IUser>;
  activateStore(userId: string): Promise<IUser>;
  deactivateStore(userId: string): Promise<IUser>;
  findAllStaff(): Promise<IUser[]>;
  deleteUser(userId: string): Promise<void>;
  findUserById(userId: string): Promise<IUser | IVendorWithApplication | null>;
  findAllDrivers(): Promise<IUser[]>;
  updateOldPassword(params: IUpdatePassword): Promise<IUser>;
  handleGoogleOAuth(profile: {
    id: string;
    emails: Array<{ value: string }>;
    displayName: string;
    photos?: Array<{ value: string }>;
  }): Promise<TokenData>;
  handleFacebookOAuth(profile: {
    id: string;
    emails: Array<{ value: string }>;
    displayName: string;
    photos?: Array<{ value: string }>;
  }): Promise<TokenData>;
  getActiveVendorsWithProducts(): Promise<IVendorWithApplication[]>;
}

export const AUTH_SERVICE_TOKEN = new Token<IAuthService>("IAuthService");
