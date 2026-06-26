import "dotenv/config";
import { parseArgs } from "util";
import { broadcastUpdate } from "../../../core/social/facebook.js";
import { ENV_VARS } from "../../../../lib/constants/index.js";
import { generateGlobalIndiceImage } from "./generateGlobalIndicePost.js";
import { GLOBAL_INDICE_FLAG } from "../../../../lib/constants/nse-scrapper/index.js";
import { globalIndexCloseDescription } from "../../../../lib/helpers/index.js";

// index.ts
const options = {
  country: {
    type: "string" as const,
    short: "c", // This allows the flag -c
  },
};

const { values } = parseArgs({
  args: process.argv.slice(2),
  options,
});

const countryName = values.country || "USA";

async function runGlobalIndiceEngine(countryName = "USA") {
  const scriptURL = ENV_VARS.STOCK_AGENT_GOOGLE_SHEET as string;

  // Append the action you want to trigger
  const url = `${scriptURL}?action=getAllIndiceData`;

  try {
    console.log("Fetching live data from Google Sheet API...");

    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store", // 🌟 Forces the engine to fetch fresh data every time
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    // 🌟 ADDED: Check for standard HTTP/Network failures first
    if (!response.ok) {
      throw new Error(
        `HTTP Error! Status: ${response.status} - ${response.statusText}`,
      );
    }

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

    // 🌟 FIX: Use the variable countryName instead of hardcoded "USA"
    const filteredIndices = data.filter(
      (item: any) =>
        item.country.trim().toLowerCase() === countryName.trim().toLowerCase(),
    );

    if (filteredIndices.length === 0) {
      throw new Error(`No data found for country: ${countryName}`);
    }

    const imageData = {
      indices: filteredIndices,
      country: countryName, // 🌟 Dynamic
      flag:
        GLOBAL_INDICE_FLAG[countryName as keyof typeof GLOBAL_INDICE_FLAG] ||
        GLOBAL_INDICE_FLAG["DEFAULT"], // 🌟 Dynamic lookup
    };

    const imageURL = await generateGlobalIndiceImage(imageData);
    const { headline, caption } = globalIndexCloseDescription(
      imageData.indices,
    );
    await broadcastUpdate(imageURL, { caption, xCaption: caption }, true);
    console.log("Successfully retrieved data:");
  } catch (error: any) {
    console.error("Error calling sheet API:", error.message);
  }
}

runGlobalIndiceEngine(countryName);
