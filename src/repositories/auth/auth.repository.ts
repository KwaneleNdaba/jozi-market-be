import crypto from "node:crypto";
import { compare, hash } from "bcryptjs";
import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  AUTH_REPOSITORY_TOKEN,
  type IAuthRepository,
} from "@/interfaces/auth/IAuthRepository .interface";
import { Sequelize, Op } from "sequelize";
import RefreshToken from "@/models/user/refreshToken.model";
import User from "@/models/user/user.model";
import VendorApplication from "@/models/vendor-application/vendorApplication.model";
import Product from "@/models/product/product.model";
import { type IUpdatePassword, type IUser, TokenData, type IVendorWithApplication } from "@/types/auth.types";

@Service({ id: AUTH_REPOSITORY_TOKEN })
export class AuthRepository implements IAuthRepository {
  public async findUserWithStats(userId: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({
        where: { id: userId },
        raw: true,
      });

      return user;
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }
  public async findUserByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({
        where: { email },
        raw: true,
      });
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async findById(userId: string): Promise<IUser> {
    try {
      return await User.findOne({
        where: { id: userId },
        raw: true,
      });
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async findUserById(userId: string): Promise<IUser | IVendorWithApplication | null> {
    try {
      const user = await User.findByPk(userId, {
        include: [
          {
            model: VendorApplication,
            as: "applicant",
            required: false,
            where: {
              status: "approved",
            },
            order: [["submittedAt", "DESC"]],
            limit: 1,
          },
        ],
        raw: false,
      });

      if (!user) {
        return null;
      }

      const userData = user.get({ plain: true });

      // If user is a vendor, include vendor application
      if (userData.role === "vendor") {
        let vendorApplication = null;
        if (userData.applicant && Array.isArray(userData.applicant) && userData.applicant.length > 0) {
          vendorApplication = userData.applicant[0];
        } else if (userData.applicant) {
          vendorApplication = userData.applicant;
        } else {
          // Fallback: get most recent approved application
          const app = await VendorApplication.findOne({
            where: {
              userId: user.id,
              status: "approved",
            },
            order: [["submittedAt", "DESC"]],
            raw: false,
          });
          vendorApplication = app ? app.get({ plain: true }) : null;
        }

        // Get product count
        const productCount = await Product.count({
          where: {
            userId: user.id,
            status: "Active",
          },
        });

        // Remove the applicant array from userData and add vendorApplication
        const { applicant, ...userWithoutApplicant } = userData;

        return {
          ...userWithoutApplicant,
          vendorApplication,
          productCount,
        } as IVendorWithApplication;
      }

      // For non-vendors, return user data without applicant array
      const { applicant, ...userWithoutApplicant } = userData;
      return userWithoutApplicant as IUser;
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }
  public async createUser(userData: IUser): Promise<IUser> {
    try {
      const createdUser = await User.create(userData as any, {
        raw: false,
      });

      return createdUser.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    try {
      await RefreshToken.create({ token, userId, expiresAt });
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async findRefreshToken(token: string): Promise<RefreshToken | null> {
    try {
      return await RefreshToken.findOne({ where: { token }, raw: true });
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async deleteRefreshToken(token: string): Promise<void> {
    try {
      await RefreshToken.destroy({ where: { token } });
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async updateUser(userData: Partial<IUser>): Promise<IUser> {
    try {
      const user = await User.findOne({
        where: { id: userData.id },
        raw: false,
      });

      if (!user) {
        return null;
      }

      await user.update(userData);

      const updatedUser = await User.findOne({
        where: { id: userData.id },
        attributes: [
          "id",
          "email",
          "role",
          "fullName",
          "phone",
          "address",
          "profileUrl",
          "isAccountBlocked",
          "canReview",
          "isPhoneConfirmed",
          "provider_type",
          "provider_user_id",
          "createdAt",
          "updatedAt",
        ],
        raw: true,
      });

      return updatedUser;
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async saveOtp(email: string, otp: string): Promise<void> {
    try {
      const user = await User.findOne({
        where: { email },
        raw: false,
      });

      if (user) {
        await user.update({ otp });
      }
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async validateOtp(email: string, otp: string): Promise<IUser> {
    try {
      return await User.findOne({
        where: { email, otp },
        raw: true,
      });
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async forgotPassword(email: string, otp: string, newPassword: string): Promise<IUser> {
    try {
      const user = await User.findOne({
        where: { email },
        raw: false,
      });

      if (user) {
        const hashedPassword = await hash(newPassword, 10);
        await user.update({
          password: hashedPassword,
          otp: "",
        });
        return user.get({ plain: true });
      }
      throw new HttpException(404, "User not found");
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async resetPasswordWithOtp(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<IUser> {
    if (!email || !otp || !newPassword) {
      throw new HttpException(400, "Email, OTP and new password are required");
    }
    try {
      const user = await User.findOne({
        where: { email, otp },
        raw: false,
      });

      if (!user) {
        throw new HttpException(400, "Invalid OTP or email");
      }
      if (typeof newPassword !== "string" || newPassword.length < 8) {
        throw new HttpException(400, "Password must be at least 8 characters");
      }

      const hashedPassword = await hash(newPassword, 10);

      await user.update({
        password: hashedPassword,
        otp: "",
      });

      return user.get({ plain: true });
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async updateUserAddress(userId: string, address: string): Promise<IUser> {
    try {
      const user = await User.findOne({
        where: { id: userId },
        raw: false,
      });

      if (!user) {
        throw new HttpException(404, "User not found");
      }

      await user.update({ address });

      return user.get({ plain: true });
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async updateUserProfile(
    userId: string,
    profileData: { fullName?: string; phone?: string; profileUrl?: string }
  ): Promise<IUser> {
    try {
      const user = await User.findOne({
        where: { id: userId },
        raw: false,
      });

      if (!user) {
        throw new HttpException(404, "User not found");
      }

      await user.update(profileData);

      return user.get({ plain: true });
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAllUsers(): Promise<IUser[]> {
    try {
      const users = await User.findAll({
        where: { role: "user" },
        attributes: [
          "id",
          "email",
          "role",
          "fullName",
          "phone",
          "address",
          "profileUrl",
          "isAccountBlocked",
          "canReview",
          "isPhoneConfirmed",
          "provider_type",
          "provider_user_id",
          "createdAt",
          "updatedAt",
        ],
        order: [["createdAt", "DESC"]],
        raw: true,
      });

      return users;
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }
  public async toggleUserAccountStatus(userId: string, isAccountBlocked: boolean): Promise<IUser> {
    try {
      const user = await User.findOne({
        where: { id: userId },
        raw: false,
      });

      if (!user) {
        throw new HttpException(404, "User not found");
      }

      await user.update({ isAccountBlocked });
      return await this.findUserById(userId);
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async toggleStoreStatus(userId: string, isStoreActive: boolean): Promise<IUser> {
    try {
      const user = await User.findOne({
        where: { id: userId },
        raw: false,
      });

      if (!user) {
        throw new HttpException(404, "User not found");
      }

      await user.update({ isStoreActive });
      return await this.findUserById(userId);
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAllStaff(): Promise<IUser[]> {
    try {
      const staff = await User.findAll({
        where: { role: "staff" },
        attributes: [
          "id",
          "email",
          "role",
          "fullName",
          "phone",
          "address",
          "profileUrl",
          "isAccountBlocked",
          "canReview",
          "isPhoneConfirmed",
          "provider_type",
          "provider_user_id",
          "createdAt",
          "updatedAt",
        ],
        order: [["createdAt", "DESC"]],
        raw: true,
      });

      return staff;
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async deleteUser(userId: string): Promise<void> {
    try {
      const user = await User.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new HttpException(404, "User not found");
      }

      await user.destroy();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, error.message);
    }
  }
  public async findAllDrivers(): Promise<IUser[]> {
    try {
      const drivers = await User.findAll({
        where: { role: "driver" },
        attributes: [
          "id",
          "email",
          "role",
          "fullName",
          "phone",
          "address",
          "profileUrl",
          "isAccountBlocked",
          "canReview",
          "isPhoneConfirmed",
          "provider_type",
          "provider_user_id",
          "createdAt",
          "updatedAt",
        ],
        order: [["createdAt", "DESC"]],
        raw: true,
      });

      return drivers;
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async updatePasswordWithOldPassword(params: IUpdatePassword): Promise<IUser> {
    const { userId, oldPassword, newPassword } = params;
    if (!userId || !oldPassword || !newPassword) {
      throw new HttpException(400, "User ID, old password, and new password are required");
    }
    try {
      const user = await User.findOne({ where: { id: userId }, raw: false });
      if (!user) {
        throw new HttpException(404, "User not found");
      }
      // Check old password
      const isMatch = await compare(oldPassword, user.password);
      if (!isMatch) {
        throw new HttpException(401, "Old password is incorrect");
      }
      if (typeof newPassword !== "string" || newPassword.length < 8) {
        throw new HttpException(400, "New password must be at least 8 characters");
      }
      const hashedPassword = await hash(newPassword, 10);
      await user.update({ password: hashedPassword });
      return user.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findOrCreateUserByProvider(providerData: {
    email: string;
    fullName: string;
    provider_type: string;
    provider_user_id: string;
    profileUrl?: string;
    phone?: string;
  }): Promise<IUser> {
    try {
      // First, try to find user by provider_user_id and provider_type
      const user = await User.findOne({
        where: {
          provider_user_id: providerData.provider_user_id,
          provider_type: providerData.provider_type,
        },
        raw: false,
      });

      if (user) {
        // Update user info if needed
        await user.update({
          email: providerData.email,
          fullName: providerData.fullName,
          profileUrl: providerData.profileUrl || user.profileUrl,
        });
        return user.get({ plain: true });
      }

      // If not found by provider, check if user exists by email
      const existingUser = await User.findOne({
        where: { email: providerData.email },
        raw: false,
      });

      if (existingUser) {
        // Link provider to existing user
        await existingUser.update({
          provider_type: providerData.provider_type,
          provider_user_id: providerData.provider_user_id,
          profileUrl: providerData.profileUrl || existingUser.profileUrl,
        });
        return existingUser.get({ plain: true });
      }

      // Create new user with provider info
      // Generate a random password for OAuth users (they won't use it)
      const randomPassword = await hash(crypto.randomBytes(32).toString("hex"), 10);

      const newUser = await User.create(
        {
          email: providerData.email,
          fullName: providerData.fullName,
          password: randomPassword,
          role: "customer",
          phone: providerData.phone || "",
          provider_type: providerData.provider_type,
          provider_user_id: providerData.provider_user_id,
          profileUrl: providerData.profileUrl,
          isAccountBlocked: false,
          canReview: false,
          isPhoneConfirmed: false,
          isEmailConfirmed: true, // OAuth providers verify email
          isStoreActive: false,
        } as any,
        {
          raw: false,
        }
      );

      return newUser.get({ plain: true });
    } catch (error: any) {
      throw new HttpException(409, error.message);
    }
  }

  public async findActiveVendorsWithProducts(): Promise<IVendorWithApplication[]> {
    try {
      // Find vendors with active stores who have at least one product
      // First, get distinct vendor IDs that have products
      const vendorsWithProducts = await Product.findAll({
        attributes: ["userId"],
        where: {
          status: "Active",
        },
        group: ["userId"],
        raw: true,
      });

      const vendorIds = vendorsWithProducts.map((p: any) => p.userId);

      if (vendorIds.length === 0) {
        return [];
      }

      // Now get vendors with active stores and their applications
      const vendors = await User.findAll({
        where: {
          id: {
            [Op.in]: vendorIds,
          },
          role: "vendor",
          isStoreActive: true,
        },
        include: [
          {
            model: VendorApplication,
            as: "applicant",
            required: false,
            where: {
              status: "approved",
            },
            order: [["submittedAt", "DESC"]],
            limit: 1,
          },
        ],
        attributes: [
          "id",
          "fullName",
          "email",
          "phone",
          "role",
          "isStoreActive",
          "profileUrl",
          "address",
          "isAccountBlocked",
          "canReview",
          "isPhoneConfirmed",
          "isEmailConfirmed",
          "createdAt",
          "updatedAt",
        ],
        raw: false,
        order: [["createdAt", "DESC"]],
      });

      // Transform to include product count and most recent approved application
      const vendorsWithData = await Promise.all(
        vendors.map(async (vendor) => {
          const vendorData = vendor.get({ plain: true });
          
          // Get product count
          const productCount = await Product.count({
            where: {
              userId: vendor.id,
              status: "Active",
            },
          });

          // Get most recent approved application
          let vendorApplication = null;
          if (vendorData.applicant && Array.isArray(vendorData.applicant) && vendorData.applicant.length > 0) {
            vendorApplication = vendorData.applicant[0];
          } else if (vendorData.applicant) {
            vendorApplication = vendorData.applicant;
          } else {
            // Fallback: get most recent approved application
            const app = await VendorApplication.findOne({
              where: {
                userId: vendor.id,
                status: "approved",
              },
              order: [["submittedAt", "DESC"]],
              raw: false,
            });
            vendorApplication = app ? app.get({ plain: true }) : null;
          }

          // Remove the applicant array from vendorData and add vendorApplication
          const { applicant, ...vendorWithoutApplicant } = vendorData;

          return {
            ...vendorWithoutApplicant,
            vendorApplication,
            productCount,
          };
        })
      );

      return vendorsWithData;
    } catch (error: any) {
      throw new HttpException(500, error.message);
    }
  }
}
