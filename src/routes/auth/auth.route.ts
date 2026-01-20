import { Router } from "express";
import passport from "passport";
import { CreateUserDto } from "@/dots/auth/user.dot";
import { authorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import { ValidationMiddleware } from "@/middlewares/ValidationMiddleware";
import type { Routes } from "@/types/routes.interface";
import { AuthController } from "../../controllers/auth/auth.controller";

export class AuthRoute implements Routes {
  public path = "/auth";
  public router = Router();
  public auth = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/signup`, this.auth.signup);
    this.router.post(`${this.path}/login`, this.auth.login);
    this.router.post(`${this.path}/refreshtoken`, authorizationMiddleware, this.auth.refreshToken);
    this.router.put(`${this.path}/updateUser`, this.auth.updateUser);
    this.router.post(`${this.path}/send-otp`, this.auth.sendOtp);
    this.router.post(`${this.path}/verify-otp`, this.auth.verifyOtp);
    this.router.post(`${this.path}/update-password`, this.auth.updatePasswordWithOtp);
    this.router.put(
      `${this.path}/update-address`,
      authorizationMiddleware,
      this.auth.updateAddress
    );
    this.router.put(
      `${this.path}/update-old-password`,
      authorizationMiddleware,
      this.auth.updateOldPassword
    );
    this.router.put(
      `${this.path}/update-profile`,
      authorizationMiddleware,
      this.auth.updateProfile
    );
    this.router.get(`${this.path}/getAllUsers`, authorizationMiddleware, this.auth.getAllUsers);
    this.router.get(
      `${this.path}/getUser/:userId`,
      authorizationMiddleware,
      this.auth.finduserById
    );
    this.router.get(
      `${this.path}/getAllDrivers`,
      authorizationMiddleware,
      this.auth.findAllDrivers
    );
    this.router.get(`${this.path}/getStaffUsers`, authorizationMiddleware, this.auth.findAllStaff);
    this.router.put(
      `${this.path}/:userId/block`,
      authorizationMiddleware,
      this.auth.blockUserAccount
    );
    this.router.put(
      `${this.path}/:userId/unblock`,
      authorizationMiddleware,
      this.auth.unblockUserAccount
    );
    this.router.put(
      `${this.path}/:userId/store/activate`,
      authorizationMiddleware,
      this.auth.activateStore
    );
    this.router.put(
      `${this.path}/:userId/store/deactivate`,
      authorizationMiddleware,
      this.auth.deactivateStore
    );
    this.router.delete(
      `${this.path}/:userId/delete`,
      authorizationMiddleware,
      this.auth.deleteUser
    );

    // Google OAuth routes
    this.router.get(
      `${this.path}/google`,
      passport.authenticate("google", { scope: ["profile", "email"], session: false })
    );

    this.router.get(
      `${this.path}/google/callback`,
      passport.authenticate("google", {
        failureRedirect: "/signin?error=oauth_failed",
        session: false,
      }),
      this.auth.googleOAuthCallback
    );

    // Facebook OAuth routes
    this.router.get(
      `${this.path}/facebook`,
      passport.authenticate("facebook", { scope: ["email"], session: false })
    );

    this.router.get(
      `${this.path}/facebook/callback`,
      passport.authenticate("facebook", {
        failureRedirect: "/signin?error=oauth_failed",
        session: false,
      }),
      this.auth.facebookOAuthCallback
    );
  }
}
