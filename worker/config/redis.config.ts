import { redisConfig } from "../../shared/config/redis.config";
import Redis from "ioredis";
export const redisClient = new Redis(redisConfig);
