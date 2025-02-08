import type { Config } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

export default {
  schema: "./src/database/schema.ts",
  out: "./src/database/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DB_URL || "",
  },
} satisfies Config;
