import * as dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "@shared/schema";

// Debugging: Log environment variables
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DATABASE_URL:", process.env.DATABASE_URL);

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in the .env file");
}

// Parse DATABASE_URL manually to handle blank password
const dbUrl = new URL(process.env.DATABASE_URL);
const host = dbUrl.hostname || process.env.DB_HOST || "localhost";
const port = Number(dbUrl.port) || Number(process.env.DB_PORT) || 3306;
const user = dbUrl.username || process.env.DB_USER || "root";
const password = dbUrl.password || process.env.DB_PASSWORD || ""; // Handle blank password
const database = dbUrl.pathname.replace("/", "") || process.env.DB_NAME || "securityburea";

// Debugging: Log parsed database credentials
console.log("Parsed DB Config:", { host, port, user, password, database });

// Create the connection pool
const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
});

// Create the drizzle database instance
export const db = drizzle(pool, { schema, mode: "default" });
export { pool };