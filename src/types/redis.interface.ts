import type { Request } from "express";
import type Redis from "ioredis";
import type { IUser } from "./auth.types";

export interface RequestWithUserAndRedis extends Request {
  user: IUser;
  redisClient: Redis;
  file: Express.Multer.File;
}
