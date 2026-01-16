import type { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { FRONTEND_URL } from "@/config";
import { HttpException } from "@/exceptions/HttpException";
import { AUTH_SERVICE_TOKEN } from "@/interfaces/auth/IAuthService.interface";
import type { IUser, IUserLogin, TokenData } from "@/types/auth.types";
import type { CustomResponse } from "@/types/response.interface";
import { resetPasswordTemplate } from "@/utils/email/templates/reset-password";
import { sendMail } from "@/utils/email/email";

export class AuthController {
  private readonly auth: any;

  constructor() {
    this.auth = Container.get(AUTH_SERVICE_TOKEN);
  }

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: IUserLogin = req.body;
      const tokenData = await this.auth.login(userData);

      const response: CustomResponse<TokenData> = {
        data: tokenData,
        message: "User logged in successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData = req.body;
      const signUpUserData = await this.auth.signup(userData);

      const response: CustomResponse<TokenData> = {
        data: signUpUserData,
        message: "User registered successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token: string = req.body.token;
      const newToken = await this.auth.refreshToken(token);

      const response: CustomResponse<TokenData> = {
        data: newToken,
        message: "Token refreshed successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.params.token;
      await this.auth.logout(token.toString());

      const response: CustomResponse<null> = {
        data: null,
        message: "User logged out successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: Partial<IUser> = req.body;
      const updatedUser = await this.auth.updateUser(userData);

      const response: CustomResponse<IUser> = {
        data: updatedUser,
        message: "User updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public sendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      console.log("Email", email);
      const message = await this.auth.sendOtp(email);
      await sendMail(email, "One Time OTP", "One time OTP", resetPasswordTemplate(message.otp));

      const response: CustomResponse<null> = {
        data: null,
        message: "OTP sent successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, otp } = req.body;
      const message = await this.auth.verifyOtp(email, otp);

      const response: CustomResponse<null> = {
        data: null,
        message,
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updatePasswordWithOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, otp, newPassword } = req.body;

      // Basic validation in controller
      if (!email || !otp || !newPassword) {
        throw new HttpException(400, "Email, OTP and new password are required");
      }

      const updatedUser = await this.auth.resetPassword(email, otp, newPassword);

      const response: CustomResponse<IUser> = {
        data: updatedUser,
        message: "Password updated successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, address } = req.body;
      const tokenData = await this.auth.updateUserAddress(userId, address);

      const response: CustomResponse<TokenData> = {
        data: tokenData,
        message: "Address updated successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
  public finduserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fetchedUser = await this.auth.findUserById(req.params.userId);

      const response: CustomResponse<IUser> = {
        data: fetchedUser,
        message: "User fetched successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, fullName, phone, profileUrl } = req.body;

      const profileData: { fullName?: string; phone?: string; profileUrl?: string } = {};
      if (fullName) profileData.fullName = fullName;
      if (phone) profileData.phone = phone;
      if (profileUrl) profileData.profileUrl = profileUrl;

      const tokenData = await this.auth.updateUserProfile(userId, profileData);

      const response: CustomResponse<TokenData> = {
        data: tokenData,
        message: "Profile updated successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getAllUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.auth.getAllUsers();

      const response: CustomResponse<IUser[]> = {
        data: users,
        message: "Users retrieved successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public blockUserAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const user = await this.auth.blockUserAccount(Number(userId));

      const response: CustomResponse<IUser> = {
        data: user,
        message: "User account blocked successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public unblockUserAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const user = await this.auth.unblockUserAccount(Number(userId));

      const response: CustomResponse<IUser> = {
        data: user,
        message: "User account unblocked successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public findAllStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.auth.findAllStaff();

      const response: CustomResponse<IUser> = {
        data: users,
        message: "Staff users retrieved successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
  public findAllDrivers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const users = await this.auth.findAllDrivers();

      const response: CustomResponse<IUser> = {
        data: users,
        message: "Driver users retrieved successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      await this.auth.deleteUser(Number(userId));

      const response: CustomResponse<void> = {
        data: null,
        message: "User deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
  public updateOldPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updatedUser = await this.auth.updateOldPassword(req.body);

      const response: CustomResponse<void> = {
        data: updatedUser,
        message: "User updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public googleOAuthCallback = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = (req as any).user; // Passport sets user on req.user

      if (!user) {
        throw new HttpException(401, "Google authentication failed");
      }

      const tokenData = await this.auth.handleGoogleOAuth(user);

      // Set tokens in cookies
      res.cookie("accessToken", tokenData.accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.cookie("refreshToken", tokenData.refreshToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 72 * 60 * 60 * 1000, // 72 hours
      });

      // Redirect to frontend with tokens in query params as fallback
      const frontendUrl = FRONTEND_URL || "http://localhost:3000";
      res.redirect(
        `${frontendUrl}/auth/callback?token=${tokenData.accessToken}&refreshToken=${tokenData.refreshToken}`
      );
    } catch (error) {
      next(error);
    }
  };

  public facebookOAuthCallback = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = (req as any).user; // Passport sets user on req.user

      if (!user) {
        throw new HttpException(401, "Facebook authentication failed");
      }

      const tokenData = await this.auth.handleFacebookOAuth(user);

      // Set tokens in cookies
      res.cookie("accessToken", tokenData.accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.cookie("refreshToken", tokenData.refreshToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 72 * 60 * 60 * 1000, // 72 hours
      });

      // Redirect to frontend with tokens in query params as fallback
      const frontendUrl = FRONTEND_URL || "http://localhost:3000";
      res.redirect(
        `${frontendUrl}/auth/callback?token=${tokenData.accessToken}&refreshToken=${tokenData.refreshToken}`
      );
    } catch (error) {
      next(error);
    }
  };
}
