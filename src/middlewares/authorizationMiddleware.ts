import type { NextFunction, Response } from "express";
import { type VerifyErrors, verify } from "jsonwebtoken";
import { SECRET_KEY } from "@/config";
import { HttpException } from "@/exceptions/HttpException";
import { type DataStoreInToken, type RequestWithUser, Role } from "@/types/auth.types";

/**
 * Base authorization middleware - verifies token and attaches user to request
 * Use this for any authenticated route
 */
export const authorizationMiddleware = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      throw new HttpException(401, "Authentication required");
    }

    verify(token, SECRET_KEY, (error: VerifyErrors, user: DataStoreInToken) => {
      if (error) {
        throw new HttpException(401, error.message);
      }

      req.user = user;
      next();
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to create role-based authorization middleware
 */
const createRoleMiddleware = (allowedRoles: Role[] | string[], roleName: string) => {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

      if (!token) {
        throw new HttpException(401, "Authentication required");
      }

      verify(token, SECRET_KEY, (error: VerifyErrors, user: DataStoreInToken) => {
        if (error) {
          throw new HttpException(401, error.message);
        }

        // Check if user's role is in the allowed roles list
        const userRole = user.role as string;
        // Convert enum values to strings for comparison
        const allowedRoleStrings = allowedRoles.map((role) =>
          typeof role === "string" ? role : role.toString()
        );
        const isAllowed = allowedRoleStrings.includes(userRole);

        if (!isAllowed) {
          throw new HttpException(403, `${roleName} access required`);
        }

        req.user = user;
        next();
      });
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Admin authorization middleware
 * Only allows users with admin role
 */
export const adminAuthorizationMiddleware = createRoleMiddleware([Role.ADMIN], "Admin");

/**
 * Vendor authorization middleware
 * Only allows users with vendor role
 */
export const vendorAuthorizationMiddleware = createRoleMiddleware([Role.VENDOR], "Vendor");

/**
 * Influencer authorization middleware
 * Only allows users with influencer role
 */
export const influencerAuthorizationMiddleware = createRoleMiddleware(
  [Role.INFLUENCER],
  "Influencer"
);

/**
 * Customer authorization middleware
 * Only allows users with customer role
 */
export const customerAuthorizationMiddleware = createRoleMiddleware([Role.CUSTOMER], "Customer");

/**
 * Admin or Vendor authorization middleware
 * Allows both admin and vendor roles
 */
export const adminOrVendorAuthorizationMiddleware = createRoleMiddleware(
  [Role.ADMIN, Role.VENDOR],
  "Admin or Vendor"
);

/**
 * Admin or Influencer authorization middleware
 * Allows both admin and influencer roles
 */
export const adminOrInfluencerAuthorizationMiddleware = createRoleMiddleware(
  [Role.ADMIN, Role.INFLUENCER],
  "Admin or Influencer"
);

/**
 * Vendor or Customer authorization middleware
 * Allows both vendor and customer roles
 */
export const vendorOrCustomerAuthorizationMiddleware = createRoleMiddleware(
  [Role.VENDOR, Role.CUSTOMER],
  "Vendor or Customer"
);

/**
 * Multiple roles authorization middleware
 * Allows admin, vendor, and influencer roles (excludes customer)
 */
export const businessUserAuthorizationMiddleware = createRoleMiddleware(
  [Role.ADMIN, Role.VENDOR, Role.INFLUENCER],
  "Business user"
);

// Legacy export for backward compatibility
export const AdminAuthorizationMiddleware = adminAuthorizationMiddleware;
