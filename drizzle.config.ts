import type { Config } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

export default {
  schema: "./shared/database/schema.ts",
  out: "./shared/database/migrations",
  dialect: "mysql",
  dbCredentials: {
    // host: process.env.DB_HOST || "localhost",
    // user: process.env.DB_USER || "root",
    // password: process.env.DB_PASSWORD || "root",
    // database: process.env.DB_NAME || "code_editor",
    // port: parseInt(process.env.DB_PORT || "3307"),
    url: process.env.DB_URL || "mysql://root:root@localhost:3307/code_editor",
  },
} satisfies Config;
