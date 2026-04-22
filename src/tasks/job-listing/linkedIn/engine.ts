import "dotenv/config.js";
import { sendTelegramJobListing } from "../../../core/notifier/telegram.js";
import runLinkenInScrapper from "./linkedin-scrapper.js";
import { RUN_LINKEDIN_SCRAPER_PAYLOAD } from "../../../../lib/constants/interview-prep/index.js";
import { splitInHalf } from "../../../../lib/helpers/index.js";

async function runLinkedInJobListing() {
  try {
    const jobsList = await runLinkenInScrapper(RUN_LINKEDIN_SCRAPER_PAYLOAD);
    if (!jobsList.length) return console.log("No Jobs Found 😐!!!");
    if (jobsList.length > 20) {
      const [firstHalf, secondHalf] = splitInHalf(jobsList) as any;
      sendTelegramJobListing(firstHalf, { src: "LinkedIn" });
      sendTelegramJobListing(secondHalf, { src: "LinkedIn" });
      return;
    }
    sendTelegramJobListing(jobsList, { src: "LinkedIn" });
  } catch (error) {
    console.log("run job listing error : ", (error as Error).message);
  }
}

runLinkedInJobListing();
