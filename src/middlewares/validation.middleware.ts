import { plainToInstance } from "class-transformer";
import { type ValidationError, validateOrReject } from "class-validator";
import type { NextFunction, Request, Response } from "express";
import { HttpException } from "../exceptions/HttpException";

export const ValidationMiddleware = (
  type: any,
  skipMissingProperties = false,
  whitelist = false,
  forbidNonWhitelisted = false
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToInstance(type, req.body);
      await validateOrReject(dto, {
        skipMissingProperties,
        whitelist,
        forbidNonWhitelisted,
      });

      req.body = dto;
      next();
    } catch (errors) {
      if (Array.isArray(errors)) {
        const message = errors
          .flatMap((error: ValidationError) =>
            error.constraints ? Object.values(error.constraints) : []
          )
          .join(", ");

        next(new HttpException(400, message || "Validation failed"));
      } else {
        next(new HttpException(400, "Validation failed"));
      }
    }
  };
};
