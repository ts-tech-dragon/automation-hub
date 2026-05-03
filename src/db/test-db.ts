import dns from "node:dns";
import os from "node:os";
// Only force DNS if we are on Windows (local dev) or if a specific flag is set
if (os.platform() === "win32" || process.env.FORCE_DNS === "true") {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
  dns.setDefaultResultOrder("ipv4first");
  console.log("🔧 Applied DNS/IPv4 fix for Windows environment.");
}

import "dotenv/config.js";
import { MongoClient, ServerApiVersion } from "mongodb";
import { ENV_VARS } from "../../lib/constants/index.js";

const uri = ENV_VARS.MONGODB_URI || "";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function testConnection() {
  try {
    console.log("⏳ Connecting to ts-fin-hub...");
    await client.connect();

    const db = client.db("ts-fin-hub");
    const collection = db.collection("test_earnings");

    const testDoc = {
      symbol: "WAAREEENER",
      company_name: "WAAREE Energies Ltd.",
      meeting_date: new Date("2026-04-29"), // Use ISO dates for sorting!
      status: "Connection Test Success",
      scraped_at: new Date(),
    };

    const result = await collection.insertOne(testDoc);
    console.log(`✅ Success! Document inserted with ID: ${result.insertedId}`);
  } catch (error) {
    // 2. Added more specific error logging
    console.error(
      "❌ Connection failed. Check your IP Whitelist (0.0.0.0/0) or Password.",
    );
    console.error(error);
  } finally {
    await client.close();
  }
}

testConnection();
