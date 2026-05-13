import YahooFinance from "yahoo-finance2";
import {
  getTimeInIST,
  getTodayDayInIST,
  isAfter330PMInIST,
} from "../../../lib/helpers/index.js";
import { getFakeIstDate } from "../../../lib/helpers/insta-earning-results/index.js";
import {
  formatCurrentPrice,
  sortDataByMarketCap,
} from "../../../lib/helpers/nse-results/index.js";
import connectDB, { closeDB } from "../index.js";
import type {
  IConcallEarningsResult,
  IEarningsResult,
} from "../models/index.js";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

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

export const getAfterMarketHrsResults = async () => {
  const db = await connectDB();
  if (!db) return console.log("Not able to connect with DB 😢");

  try {
    const isMonday = getTodayDayInIST(1);
    const gteDate = isMonday
      ? new Date(`${getTimeInIST("YYYY-MM-DD", 3)}T15:15:00.000Z`)
      : new Date(`${getTimeInIST("YYYY-MM-DD", 1)}T15:15:00.000Z`);
    // 1. Translate ISODate to native JS Date objects
    const query = {
      ...(isMonday ? {} : { isAfterMarketHours: true }),
      scraped_at: {
        $gte: gteDate,
        $lt: new Date(`${getTimeInIST("YYYY-MM-DD")}T00:00:00.000Z`),
      },
    };

    // 2. Use .find() and convert the cursor .toArray()
    const stocks = await db.collection("daily_earnings").find(query).toArray();

    // Return the new combined objects
    const updatedStocksWithMarketCaps = await Promise.all(
      stocks.map(async (item) => {
        let marketCap = item.marketCap || null;
        if (!Boolean(marketCap)) {
          try {
            // NSE symbols on Yahoo Finance need the ".NS" suffix
            const querySymbol = `${item.symbol}.NS`;
            const result = await yahooFinance.quote(querySymbol);

            marketCap = formatCurrentPrice(result.marketCap); // This returns the value in absolute numbers (e.g., 150000000000)
          } catch (error) {
            console.error("Error fetching from Yahoo:", error);
          }
        }

        return {
          ...item,

          // marketCapMap.get(item.symbol) retrieves the value we fetched from the DB
          marketCap: marketCap || "N/A", // Fallback to "N/A" if not found in DB or Yahoo
        };
      }),
    );

    console.log(
      `✅ Found ${updatedStocksWithMarketCaps.length} stocks from the query.`,
    );
    return sortDataByMarketCap(updatedStocksWithMarketCaps as any[]);
  } catch (error) {
    console.log("❌ Fetch Error : ", (error as Error).message);
    return [];
  }
};

export async function injectMarketCaps(geminiResults: any[]) {
  const db = await connectDB();
  if (!db) return console.log("Not able to connect with DB 😢");
  const symbols = [...new Set(geminiResults.map((item) => item.symbol))];

  // The DB returns an array of objects: [{symbol: 'ABC', marketCap: '...'}, ...]
  const dbStocks = await db
    .collection("daily_earnings")
    .find({ symbol: { $in: symbols } })
    .toArray();

  // Create a lookup dictionary
  const marketCapMap = new Map(
    dbStocks.map((stock) => [stock.symbol, stock.marketCap]),
  );

  // Return the new combined objects
  return await Promise.all(
    geminiResults.map(async (item) => {
      let marketCap = marketCapMap.get(item.symbol) || null;
      if (!Boolean(marketCap)) {
        try {
          // NSE symbols on Yahoo Finance need the ".NS" suffix
          const querySymbol = `${item.symbol}.NS`;
          const result = await yahooFinance.quote(querySymbol);

          marketCap = formatCurrentPrice(result.marketCap); // This returns the value in absolute numbers (e.g., 150000000000)
        } catch (error) {
          console.error("Error fetching from Yahoo:", error);
        }
      }

      return {
        ...item,

        // marketCapMap.get(item.symbol) retrieves the value we fetched from the DB
        marketCap: marketCap || "N/A", // Fallback to "N/A" if not found in DB or Yahoo
      };
    }),
  );
}

async function removeDuplicateStocks() {
  const db = await connectDB();
  const collection = db.collection("daily_earnings"); // or "daily_earnings"

  try {
    const duplicates = await collection
      .aggregate([
        {
          // 1. Group by symbol
          $group: {
            _id: { symbol: "$symbol" },
            uniqueIds: { $addToSet: "$_id" },
            count: { $sum: 1 },
          },
        },
        {
          // 2. Only look for groups with more than 1 document
          $match: {
            count: { $gt: 1 },
          },
        },
      ])
      .toArray();

    // 3. Prepare IDs to delete
    const idsToDelete: any[] = [];
    duplicates.forEach((doc) => {
      // Keep the first ID, discard the rest
      const [keep, ...rest] = doc.uniqueIds;
      idsToDelete.push(...rest);
    });

    if (idsToDelete.length > 0) {
      const result = await collection.deleteMany({
        _id: { $in: idsToDelete },
      });
      console.log(
        `✅ Successfully removed ${result.deletedCount} duplicate symbols.`,
      );
    } else {
      console.log("✨ No duplicates found. Your DB is clean!");
    }
  } catch (error) {
    console.error("Cleanup Error:", error);
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
