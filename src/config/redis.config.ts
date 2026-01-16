import Redis from "ioredis";
import { logger } from "@/utils/logger";
import { REDIS_URL } from "./index";

let redisClient: Redis | null = null;

export const initializeRedis = (): Redis => {
  if (!redisClient) {
    if (!REDIS_URL) {
      logger.warn("REDIS_URL not configured. Rate limiting will use in-memory store.");
      return null as any;
    }

    redisClient = new Redis(REDIS_URL, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    redisClient.on("connect", () => {
      logger.info("Redis client connected successfully");
    });

    redisClient.on("error", (error) => {
      logger.error("Redis client error:", error);
    });

    redisClient.on("close", () => {
      logger.warn("Redis client connection closed");
    });
  }

  return redisClient;
};

export const getRedisClient = (): Redis | null => {
  return redisClient;
};
