import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { dbConfig } from "../../shared/config/database.config";
import * as schema from "../../shared/database/schema";
dotenv.config();

const poolConnection = mysql.createPool(dbConfig);

export const db = drizzle(poolConnection, { schema, mode: "default" });
