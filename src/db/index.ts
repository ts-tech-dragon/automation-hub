import dns from "node:dns";
import os from "node:os";
// Only force DNS if we are on Windows (local dev) or if a specific flag is set
if (os.platform() === "win32" || process.env.FORCE_DNS === "true") {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
  dns.setDefaultResultOrder("ipv4first");
  console.log("🔧 Applied DNS/IPv4 fix for Windows environment.");
}

import "dotenv/config.js";
import { MongoClient, ServerApiVersion, Db } from "mongodb";
import { ENV_VARS } from "../../lib/constants/index.js";

const uri = ENV_VARS.MONGODB_URI || "";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Cache the database connection
let cachedDb: Db | null = null;

async function connectDB(dbName = "ts-fin-hub"): Promise<Db> {
  // If we already have a connection, return it immediately
  if (cachedDb) {
    return cachedDb;
  }

  try {
    console.log("⏳ Connecting to MongoDB...");
    await client.connect();

    cachedDb = client.db(dbName);
    console.log("✅ Database connected successfully.");
    return cachedDb;
  } catch (error) {
    console.error(
      "❌ Connection failed. Check your IP Whitelist (0.0.0.0/0) or Password.",
    );
    console.error(error);
    throw error; // Rethrow so the scraper knows it failed
  }
  // REMOVED: finally { await client.close(); }
  // We keep it open so the scraper can actually use it!
}

// Optional: Function to close the connection at the very end of your script
export const closeDB = async () => {
  await client.close();
  cachedDb = null;
  console.log("🔌 MongoDB connection closed.");
};

export default connectDB;
