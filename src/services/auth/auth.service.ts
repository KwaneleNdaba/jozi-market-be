import crypto from "node:crypto";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { Inject, Service } from "typedi";
import { AUTH_REPOSITORY_TOKEN, type IAuthRepository } from "@/interfaces/auth/IAuthRepository .interface";
import { AUTH_SERVICE_TOKEN, type IAuthService } from "@/interfaces/auth/IAuthService.interface";
import type { DataStoreInToken, IUpdatePassword, IUser, IUserLogin, TokenData } from "@/types/auth.types";
import { SECRET_KEY } from "../../config";
import { HttpException } from "../../exceptions/HttpException";

@Service({ id: AUTH_SERVICE_TOKEN })
export class AuthService implements IAuthService {
    constructor(@Inject(AUTH_REPOSITORY_TOKEN) private readonly authRepository: IAuthRepository) { }

    private async createToken(userData: IUser): Promise<TokenData> {
        const dataStoredInToken: DataStoreInToken = {
            id: userData.id,
            email: userData.email,
            role: userData.role,
            isAccountBlocked: userData.isAccountBlocked,
            canReview: userData.canReview,
            fullName: userData.fullName,
            phone: userData.phone,
            isPhoneConfirmed: userData.isPhoneConfirmed,
            profileUrl: userData.profileUrl,
            address: userData.address,
            provider_type: userData.provider_type,
            provider_user_id: userData.provider_user_id
        };

        if (!SECRET_KEY) {
            throw new HttpException(500, "SECRET_KEY is not configured. Please set it in your environment variables.");
        }

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 72);

        const accessToken = sign(
            dataStoredInToken,
            SECRET_KEY,
            { expiresIn: "1d" }
        );

        const refreshToken = crypto.randomBytes(40).toString("hex");

        return { expiresAt, accessToken, refreshToken };
    }
    public async signup(userData: IUser): Promise<TokenData> {
        const findUser = await this.authRepository.findUserByEmail(userData.email);
        if (findUser) {
            throw new HttpException(409, `This email ${userData.email} already exists`);
        }
        const hashedPassword = await hash(userData.password, 10);
        const createdUser = await this.authRepository.createUser({
            ...userData,
            password: hashedPassword
        });
        return await this.createToken(createdUser);
    }

    public async login(userData: IUserLogin): Promise<TokenData> {
        try {
            if (!userData.password) {
                throw new HttpException(400, "Password is required");
            }

            const findUser = await this.authRepository.findUserByEmail(userData.email);
            if (!findUser) {
                throw new HttpException(404, `Email ${userData.email} not found`);
            }

            if (!findUser.password) {
                throw new HttpException(404, "User password not found in database");
            }

            const comparePassword = await compare(userData.password, findUser.password);
            if (!comparePassword) {
                throw new HttpException(400, "Invalid password");
            }

            return await this.createToken(findUser);
        } catch (error) {
            throw new HttpException(500, error.message);
        }
    }

    public async refreshToken(token: string): Promise<TokenData> {
        if (!token) {
            throw new HttpException(404, "Token not provided");
        }

        const storedToken = await this.authRepository.findRefreshToken(token);
        if (!storedToken || new Date(storedToken.expiresAt) < new Date()) {
            throw new HttpException(401, "Invalid or expired token");
        }

        const user = await this.authRepository.findUserById(storedToken.userId);
        if (!user) {
            throw new HttpException(404, `User associated with this token not found`);
        }

        const newToken = await this.createToken(user);
        await this.authRepository.deleteRefreshToken(token);
        await this.authRepository.saveRefreshToken(user.id, newToken.refreshToken, newToken.expiresAt);
        return newToken;
    }

    public async logout(token: string): Promise<void> {
        await this.authRepository.deleteRefreshToken(token);
    }

    

    public async updateUser(userData: Partial<IUser>): Promise<TokenData> {
        if (!userData.id) {
            throw new HttpException(400, 'User ID is required for update');
        }

        const existingUser = await this.authRepository.findById(userData.id);
        if (!existingUser) {
            throw new HttpException(404, 'User not found');
        }

        if (userData.password) {
            userData.password = await hash(userData.password, 10);
        }

        const updateResult = await this.authRepository.updateUser(userData);

        if (!updateResult) {
            throw new HttpException(500, 'Failed to update user');
        }
        const updatedUser = await this.authRepository.findById(userData.id);

        if (!updatedUser) {
            throw new HttpException(500, 'Failed to retrieve updated user');
        }

        return await this.createToken(updatedUser);
    }

    public async sendOtp(email: string): Promise<any> {
        const user = await this.authRepository.findUserByEmail(email);
        if (!user) {
            throw new HttpException(404, "User Not Found");
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await this.authRepository.saveOtp(email, otp);
        const response = {
            otp,
            fullName: user.email,
        }
        return response;
    }

    public async verifyOtp(email: string, otp: string): Promise<string> {
        const isValid = await this.authRepository.validateOtp(email, otp);
        if (!isValid) {
            throw new HttpException(400, "Invalid or expired OTP");
        }
        return "OTP verified successfully";
    }

    public async resetPassword(
        email: string,
        otp: string,
        newPassword: string
    ): Promise<IUser> {
        try {
            if (!email || !email.includes('@')) {
                throw new HttpException(400, "Valid email is required");
            }

            if (!otp || otp.length !== 6) {
                throw new HttpException(400, "Valid 6-digit OTP is required");
            }

            const updatedUser = await this.authRepository.resetPasswordWithOtp(
                email,
                otp,
                newPassword
            );

            return updatedUser;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(400, error.message || "Password reset failed");
        }
    }
    public async findUserById(userId: string): Promise<IUser | null> {
        try {
            return await this.authRepository.findUserById(userId);
        } catch (error) {
            throw new HttpException(409,error.message)
        }
    }

    public async updateUserAddress(userId: string, address: string): Promise<TokenData> {
        if (!userId) {
            throw new HttpException(400, 'User ID is required');
        }

        if (!address || address.trim().length === 0) {
            throw new HttpException(400, 'Address is required');
        }

        const updatedUser = await this.authRepository.updateUserAddress(userId, address.trim());
        return await this.createToken(updatedUser);
    }

    public async updateUserProfile(userId: string, profileData: { fullName?: string; phone?: string; profileUrl?: string }): Promise<TokenData> {
        if (!userId) {
            throw new HttpException(400, 'User ID is required');
        }

        if (!profileData || Object.keys(profileData).length === 0) {
            throw new HttpException(400, 'Profile data is required');
        }

        const updatedUser = await this.authRepository.updateUserProfile(userId, profileData);
        return await this.createToken(updatedUser);
    }

    public async getAllUsers(): Promise<IUser[]> {
        try {
            return await this.authRepository.findAllUsers();
        } catch (error) {
            throw new HttpException(500, error.message);
        }
    }
    public async blockUserAccount(userId: string): Promise<IUser> {
        try {
            return await this.authRepository.toggleUserAccountStatus(userId, true);
        } catch (error) {
            throw new HttpException(500, error.message)
        }
    }

    public async unblockUserAccount(userId: string): Promise<IUser> {
        try {
            return await this.authRepository.toggleUserAccountStatus(userId, false);
        } catch (error) {
            throw new HttpException(500, error.message)
        }
    }

      public async findAllStaff(): Promise<IUser[]> {
        try {
            return await this.authRepository.findAllStaff();
        } catch (error) {
            throw new HttpException(500, error.message)
        }
    }

    public async deleteUser(userId: string): Promise<void> {
        try {
            await this.authRepository.deleteUser(userId);
        } catch (error) {
            throw new HttpException(500, error.message)
        }
    }
    public async findAllDrivers(): Promise<IUser[]> {
        try {
            return await this.authRepository.findAllDrivers();
        } catch (error) {
            throw new HttpException(500, error.message)
        }
    }


    public async updateOldPassword(params: IUpdatePassword): Promise<IUser> {
        try {
            return await this.authRepository.updatePasswordWithOldPassword(params);
        } catch (error) {
            throw new HttpException(500, error.message);
        }
    }

    public async handleGoogleOAuth(profile: {
        id: string;
        emails: Array<{ value: string }>;
        displayName: string;
        photos?: Array<{ value: string }>;
    }): Promise<TokenData> {
        try {
            if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
                throw new HttpException(400, "Email is required from Google profile");
            }

            const user = await this.authRepository.findOrCreateUserByProvider({
                email: profile.emails[0].value,
                fullName: profile.displayName,
                provider_type: "google",
                provider_user_id: profile.id,
                profileUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined,
            });

            const tokenData = await this.createToken(user);
            await this.authRepository.saveRefreshToken(user.id, tokenData.refreshToken, tokenData.expiresAt);

            return tokenData;
        } catch (error) {
            throw new HttpException(500, error.message);
        }
    }

    public async handleFacebookOAuth(profile: {
        id: string;
        emails: Array<{ value: string }>;
        displayName: string;
        photos?: Array<{ value: string }>;
    }): Promise<TokenData> {
        try {
            if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
                throw new HttpException(400, "Email is required from Facebook profile");
            }

            const user = await this.authRepository.findOrCreateUserByProvider({
                email: profile.emails[0].value,
                fullName: profile.displayName,
                provider_type: "facebook",
                provider_user_id: profile.id,
                profileUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined,
            });

            const tokenData = await this.createToken(user);
            await this.authRepository.saveRefreshToken(user.id, tokenData.refreshToken, tokenData.expiresAt);

            return tokenData;
        } catch (error) {
            throw new HttpException(500, error.message);
        }
    }


}