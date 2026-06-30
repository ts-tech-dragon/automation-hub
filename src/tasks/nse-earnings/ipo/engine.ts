import "dotenv/config";
import { generateIpoListingsImage } from "./generateIpoListingPost.js";
import { runIpoListingScrapper } from "./ipoListingScrapper.js";
import { generateListingsDescription } from "../../../../lib/helpers/index.js";
import { broadcastUpdate } from "../../../core/social/facebook.js";

const runIpoEngine = async () => {
  try {
    const result = await runIpoListingScrapper();
    if (result.length === 0) return console.log("NO IPO LISTING TODAY!!!");
    const imageURL = await generateIpoListingsImage(result);
    const { headline, caption } = generateListingsDescription(result);
    await broadcastUpdate(imageURL, { caption, xCaption: caption }, true);
    console.log("Successfully posted IPO data");
  } catch (error) {
    console.log("run ipo enginer error : ", (error as Error).message);
  }
};

runIpoEngine();
