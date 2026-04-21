import "dotenv/config";
import { sendTelegramJobListing } from "../../core/notifier/telegram.js";
import { MOCK_INTERVIEW_JOBS } from "../../../lib/constants/job-listing/mock.js";
import { runScrapeIndeed } from "./indeed-scrapper.js";
import { RUN_INDEED_SCRAPER_PAYLOAD } from "../../../lib/constants/interview-prep/index.js";
import { splitInHalf } from "../../../lib/helpers/index.js";

async function runJobListing() {
  try {
    const locations = RUN_INDEED_SCRAPER_PAYLOAD.locations;
    for (const location of locations) {
      const jobsList = await runScrapeIndeed(
        RUN_INDEED_SCRAPER_PAYLOAD,
        location,
      );
      if (jobsList.length > 20) {
        const [firstHalf, secondHalf] = splitInHalf(jobsList) as any;
        sendTelegramJobListing(firstHalf, { src: "Indeed", loc: location });
        sendTelegramJobListing(secondHalf, { src: "Indeed", loc: location });
        return;
      }
      sendTelegramJobListing(jobsList, { src: "Indeed", loc: location });
    }
  } catch (error) {
    console.log("run job l6isting error : ", (error as Error).message);
  }
}

runJobListing();
