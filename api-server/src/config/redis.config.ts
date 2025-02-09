import Redis from "ioredis";
import dotenv from "dotenv";
import { redisConfig } from "../../../shared/config/redis.config";
dotenv.config();
export const redisClient = new Redis(redisConfig);
