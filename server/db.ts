import * as dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Debugging: Log environment variables
console.log("DATABASE_URL:", process.env.DATABASE_URL);

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in the .env file");
}

// Create the connection
const client = postgres(process.env.DATABASE_URL);

// Create the drizzle database instance
export const db = drizzle(client, { schema });
export { client as pool };