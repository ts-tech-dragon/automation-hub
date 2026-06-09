import "dotenv/config";
import { MOCK_FII_DII_DATA } from "../../../../lib/constants/nse-scrapper/mock.js";
import {
  fiiDiiDataFlowDescription,
  isWeekendInIST,
} from "../../../../lib/helpers/index.js";
import { isMarketHoliday } from "../../../../lib/helpers/insta-earning-results/index.js";
import { sendTelegramStockImage } from "../../../core/notifier/telegram.js";
import { broadcastUpdate } from "../../../core/social/facebook.js";
import { closeDB } from "../../../db/index.js";
import {
  getThisWeeksData,
  saveFiiDiiData,
} from "../../../db/services/fiiDiiData.js";
import { runFiiDiiScrapper } from "./fiiDiiScrapper.js";
import { generateFiiDiiChart } from "./generateFiiDiiChart.js";

const runFiiDiiEngine = async () => {
  try {
    const fiiDiiResult = await runFiiDiiScrapper();
    if (!fiiDiiResult || fiiDiiResult.length === 0) {
      console.log("No FII/DII data found for today yet.");
      return false; // Return false so the loop knows to check again
    }
    await saveFiiDiiData(fiiDiiResult);
    const weeklyData = await getThisWeeksData();
    // const weeklyData = MOCK_FII_DII_DATA; // Mock data for testing
    const fiiDiiChartURL = await generateFiiDiiChart(weeklyData);
    const description = fiiDiiDataFlowDescription(fiiDiiResult);
    await broadcastUpdate(
      fiiDiiChartURL,
      { caption: description.caption, xCaption: description.caption },
      true,
    );
    // await sendTelegramStockImage(description, fiiDiiChartURL, true);
    return true; // 🌟 FIX: Return true to break the loop on success
  } catch (error) {
    console.error("Error running FII/DII engine:", (error as Error).message);
    return false; // Return false to indicate failure and trigger retry
  } finally {
    closeDB();
  }
};

const monitorRunFiiDiiEngine = async () => {
  const isNotMarketHours = isWeekendInIST() || isMarketHoliday();
  if (isNotMarketHours) {
    return console.log("Market is closed today. Skipping FII/DII engine run.");
  }

  let isCompleted = false;
  const SLEEP_INTERVAL = 15 * 60 * 1000; // 15 minutes

  while (!isCompleted) {
    console.log("⏱️ Checking for FII/DII data...");
    // 🌟 FIX: Added 'await' to ensure the execution waits for the scraper resolution
    isCompleted = await runFiiDiiEngine();

    if (!isCompleted) {
      console.log(`Sleeping for 15 minutes before next retry...`);
      await new Promise((resolve) => setTimeout(resolve, SLEEP_INTERVAL));
    }
  }

  // 🌟 FIX: Only close the DB pool *after* the entire monitoring process is fully finished
  console.log("🏁 Cycle completed. Shutting down database connections.");
  await closeDB();
};

monitorRunFiiDiiEngine();
