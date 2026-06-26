import "dotenv/config";
import { generateWeeklyMoversImage } from "./generateGainersLosersPost.js";
import {
  gainersLosersDescription,
  getToppersAndLossers,
} from "../../../../lib/helpers/index.js";
import { broadcastUpdate } from "../../../core/social/facebook.js";
import { ENV_VARS } from "../../../../lib/constants/index.js";

async function runGainersLoserEngine() {
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
      return b.change - a.change;
    });
    const { gainers, losers } = getToppersAndLossers(updatedData);
    const imageURL = await generateWeeklyMoversImage(gainers, losers);
    const { headline, caption, xCaption } = gainersLosersDescription(
      gainers,
      losers,
    );
    await broadcastUpdate(imageURL, { caption, xCaption }, true);
    console.log("Successfully retrieved data:");
  } catch (error: any) {
    console.error("Error calling sheet API:", error.message);
  }
}

runGainersLoserEngine();
