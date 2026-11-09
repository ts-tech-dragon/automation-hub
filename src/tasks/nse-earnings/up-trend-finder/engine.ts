import "dotenv/config";
import {
  gainersLosersDescription,
  getToppersAndLossers,
  getToppersOfTheDay,
} from "../../../../lib/helpers/index.js";
import { broadcastUpdate } from "../../../core/social/facebook.js";
import { ENV_VARS } from "../../../../lib/constants/index.js";
import { generateWeeklyMoversImage } from "../top-gainers-losers/generateGainersLosersPost.js";
import { generateUpTrendImage } from "./generateUpTrendPost.js";
import { sendTelegramStockImage } from "../../../core/notifier/telegram.js";
import { getFormattedDateInIST } from "../../../../lib/helpers/day.js";

async function runUpTrendFinderEngine() {
  const scriptURL = ENV_VARS.STOCK_AGENT_GOOGLE_SHEET as string;

  // Append the action you want to trigger
  const url = `${scriptURL}?action=getWeeklyGainerLoser`;

  try {
    console.log("Fetching live data from Google Sheet API...");

    // Explicitly configure redirect handling
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
    });

    // Debugging safeguard: Check what Google is actually serving back
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      const htmlText = await response.text();
      if (htmlText.includes("Service Login")) {
        throw new Error(
          "Google is demanding a login page. Please check your deployment 'Who has access' configuration and set it to 'Anyone'.",
        );
      }
      throw new Error(
        `Expected JSON but received HTML. Snapshot: ${htmlText.slice(0, 150)}...`,
      );
    }

    const data = await response.json();
    const updatedData = data.sort((a: any, b: any) => {
      return b.todaychange - a.todaychange;
    });
    const gainers = getToppersOfTheDay(updatedData);
    const imageURL = await generateUpTrendImage(gainers);
    if (imageURL) {
      const todayDate = getFormattedDateInIST("DD MMM YYYY", 0);
      await sendTelegramStockImage(
        `Daily Gainers ${todayDate}`,
        imageURL,
        true,
      );
      console.log("Successfully retrieved data:", imageURL);
      return;
    }
  } catch (error: any) {
    console.error("Error calling sheet API:", error.message);
  }
}

runUpTrendFinderEngine();
