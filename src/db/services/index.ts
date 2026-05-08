import { isAfter330PMInIST } from "../../../lib/helpers/index.js";
import { getFakeIstDate } from "../../../lib/helpers/insta-earning-results/index.js";
import connectDB, { closeDB } from "../index.js";
import type {
  IConcallEarningsResult,
  IEarningsResult,
} from "../models/index.js";

export const saveDailyResults = async (data: IEarningsResult[]) => {
  const db = await connectDB();
  if (!db) return console.log("Not able to connect with DB 😢");
  try {
    const bulkStockUpdate = data.map((item) => {
      return {
        updateOne: {
          filter: { symbol: item.symbol },
          update: {
            $set: {
              // Updates every time the scraper sees this stock
              meeting_date: getFakeIstDate(item.meeting_date),
              scraped_at: getFakeIstDate(),
              isAfterMarketHours: isAfter330PMInIST(),

              // Updating financials every run ensures we have the latest numbers
              financials: item.financials,
              dividend_declared: item.dividend_declared,
              dividend_amount: item.dividend_amount,

              // Adjusted Sentiment logic (feel free to change thresholds)
              sentiment:
                item.financials.profit_yoy_chg_pct > 20
                  ? "Bullish"
                  : item.financials.profit_yoy_chg_pct < 0
                    ? "Bearish" // Changed from BEARISH to match standard casing
                    : "Neutral",
            },
            $setOnInsert: {
              // ONLY runs once when the stock is first added today
              company_name: item.company_name,
              symbol: item.symbol,
              processed_for_instagram: false, // Ensures it doesn't reset on updates
            },
          },
          upsert: true, // Crucial: This tells MongoDB to insert if the symbol is not found
        },
      };
    });

    // 🚀 Added 'await' here
    const result = await db
      .collection("daily_earnings")
      .bulkWrite(bulkStockUpdate);
    console.log(
      `✅ Data Added to DB Successfully! Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}`,
    );

    return result;
  } catch (error) {
    console.log("saveDailyResults Error : ", (error as Error).message);
  } finally {
  }
};

/**
 * Updates stock data in MongoDB.
 * If the symbol exists, it updates marketCap and eps.
 * If the symbol does not exist, it inserts the entire API object.
 * @param {Array} apiData - The array of objects from your API
 */
export async function syncConcallDataToDB(apiData: IConcallEarningsResult[]) {
  const db = await connectDB();
  if (!db) return console.log("Not able to connect with DB 😢");

  // 1. Map the API array into MongoDB bulk operations
  const bulkOperations = apiData.map((apiItem) => {
    return {
      updateOne: {
        filter: { symbol: apiItem.symbol }, // Find the document by the symbol
        update: {
          // $set applies to BOTH existing documents and brand-new inserted documents
          $set: {
            marketCap: apiItem.marketCap,
            eps: apiItem.eps ?? 0, // Renamed slightly to avoid confusing with your nested financials.eps_current
            name: apiItem.name,
          },
          // $setOnInsert ONLY applies if the symbol is NOT found and a new document is created
          $setOnInsert: {
            symbol: apiItem.symbol,
            processed_for_instagram: false,
            dividend_declared: false,
          },
        },
        upsert: true, // Crucial: This tells MongoDB to insert if the symbol is not found
      },
    };
  });

  // 2. Execute the bulk write
  if (!Boolean(bulkOperations.length > 0))
    return console.log("No valid data to sync after mapping.");

  try {
    console.log(
      `🚀 Executing bulk write for ${bulkOperations.length} items...`,
    );
    const result = await db
      .collection("daily_earnings")
      .bulkWrite(bulkOperations);

    console.log("✅ Sync Complete!");
    console.log(`- Matched & Updated: ${result.matchedCount}`);
    console.log(`- Brand New Inserted: ${result.upsertedCount}`);
  } catch (error) {
    console.error("❌ Error during bulk update:", error);
  }
}

export const getWeeklyTopPerformers = async () => {
  const db = await connectDB();
  // Add your logic to query the top 5 for tsfinnews here
};

/**
 * Renames the 'eps_api' field to 'eps' for all documents in the collection.
 * @param {import('mongodb').Db} db - Your MongoDB database instance
 */
async function fixEpsFieldName() {
  const db = await connectDB();
  const collection = db.collection("daily_earnings"); // Use your actual collection name

  try {
    console.log("🔍 Looking for documents with 'eps_api'...");

    const result = await collection.updateMany(
      { eps_api: { $exists: true } }, // 1. Filter: Only target documents that actually have the mistake
      { $rename: { eps_api: "eps" } }, // 2. Update: Rename the field
    );

    console.log("✅ Database Cleanup Complete!");
    console.log(`- Documents found and updated: ${result.modifiedCount}`);
    await closeDB();
  } catch (error) {
    console.error("❌ Error renaming fields:", error);
  }
}
