import { Token } from "typedi";
import type RefreshToken from "@/models/user/refreshToken.model";
import { type IUpdatePassword, type IUser, TokenData } from "@/types/auth.types";

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<IUser | null>;
  createUser(userData: Partial<IUser>): Promise<IUser>;
  saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  findRefreshToken(token: string): Promise<RefreshToken | null>;
  findUserById(userId: string): Promise<IUser | null>;
  deleteRefreshToken(tokenId: string): Promise<void>;
  updateUser(userData: Partial<IUser>): Promise<IUser>;
  findById(userId: string): Promise<IUser>;
  saveOtp(email: string, otp: string): Promise<void>;
  validateOtp(email: string, otp: string): Promise<IUser>;
  forgotPassword(email: string, otp: string, newPassword: string): Promise<IUser>;
  resetPasswordWithOtp(email: string, otp: string, newPassword: string): Promise<IUser>;
  findAllStaff(): Promise<IUser[]>;
  deleteUser(userId: string): Promise<void>;
  findAllDrivers(): Promise<IUser[]>;
  findAllUsers(): Promise<IUser[]>;
  updateUserAddress(userId: string, address: string): Promise<IUser>;
  updateUserProfile(
    userId: string,
    profileData: { fullName?: string; phone?: string; profileUrl?: string }
  ): Promise<IUser>;
  toggleUserAccountStatus(userId: string, isAccountBlocked: boolean): Promise<IUser>;
  toggleStoreStatus(userId: string, isStoreActive: boolean): Promise<IUser>;
  updatePasswordWithOldPassword(params: IUpdatePassword): Promise<IUser>;
  findOrCreateUserByProvider(providerData: {
    email: string;
    fullName: string;
    provider_type: string;
    provider_user_id: string;
    profileUrl?: string;
    phone?: string;
  }): Promise<IUser>;
}

export const AUTH_REPOSITORY_TOKEN = new Token<IAuthRepository>("IAuthRepository");
