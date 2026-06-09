import dayjs from "dayjs";
import connectDB, { closeDB } from "../index.js";
import type { IFiiDiiData } from "../models/index.js";
import { convertDateToIST } from "../../../lib/helpers/day.js";
export const saveFiiDiiData = async (data: IFiiDiiData[]) => {
  const db = await connectDB();
  if (!db) return console.log("Not able to connect with DB 😢");

  try {
    // 1. Find the specific DII and FII objects from the scraped array
    const diiData = data.find((entry) => entry.category === "DII");
    const fiiData = data.find((entry) => entry.category.includes("FII"));

    if (!diiData || !fiiData) {
      return console.log("⚠️ Missing DII or FII data, aborting save.");
    }

    // 2. Convert the date string to a native Date object
    // (We can use diiData.date since both share the same date)
    const targetDate = convertDateToIST(diiData.date, "DD-MMM-YYYY");

    // 3. Do ONE update operation for the whole day
    await db.collection("fii_dii_data").updateOne(
      { date: targetDate }, // Filter: Just look for today's date
      {
        $set: {
          diiNetValue: parseFloat(diiData.netValue),
          fiiNetValue: parseFloat(fiiData.netValue),
        },
      },
      { upsert: true }, // Create it if it doesn't exist
    );

    console.log(`✅ Consolidated FII/DII data saved for ${diiData.date}`);
  } catch (error) {
    console.error("Error saving FII/DII data:", (error as Error).message);
  }
};

export async function getThisWeeksData() {
  const db = await connectDB();

  // Get Monday of the current week at 00:00:00
  // Note: dayjs().startOf('week') usually defaults to Sunday depending on locale,
  // so adding 1 day ensures you start on Monday.
  const startOfWeek = dayjs().startOf("week").add(1, "day").toDate();
  const today = dayjs().endOf("day").toDate();

  const weeklyData = await db
    .collection("fii_dii_data")
    .find({
      date: {
        $gte: startOfWeek,
        $lte: today,
      },
    })
    .sort({ date: 1 }) // Sort chronologically
    .toArray();

  return weeklyData;
}
