import { Redis } from "ioredis";
import { redisConfig } from "../../../shared/config/redis.config";

export const sub = new Redis(redisConfig);

sub.subscribe("submission", (err) => {
  if (err) {
    console.error("Failed to subscribe:", err);
  } else {
    console.log("Subscribed to submission channel");
  }
});
