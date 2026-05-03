import connectDB, { closeDB } from "../index.js";
import type { IEarningsResult } from "../models/index.js";

export const saveDailyResults = async (data: IEarningsResult[]) => {
  const db = await connectDB();
  if (!db) return console.log("Not able to connect with DB 😢");
  try {
    // Transform and add metadata for better filtering later
    const docsToInsert = data.map((item) => ({
      ...item,
      meeting_date: new Date(item.meeting_date), // Ensure this is a real Date object
      scraped_at: new Date(),
      processed_for_instagram: false,
      sentiment:
        item.financials.profit_yoy_chg_pct > 20
          ? "Bullish"
          : item.financials.profit_yoy_chg_pct > 20
            ? "BEARISH"
            : "Neutral/Bearish",
    }));
    const result = db.collection("daily_earnings").insertMany(docsToInsert);
    console.log("Data Added to DB Successfully!!!");
    return result;
  } catch (error) {
    console.log("saveDailyResults Error : ", (error as Error).message);
  } finally {
  }
};

export const getWeeklyTopPerformers = async () => {
  const db = await connectDB();
  // Add your logic to query the top 5 for tsfinnews here
};
