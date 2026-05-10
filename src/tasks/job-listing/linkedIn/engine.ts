import "dotenv/config.js";
import { sendTelegramJobListing } from "../../../core/notifier/telegram.js";
import runLinkenInScrapper from "./linkedin-scrapper.js";
import { RUN_LINKEDIN_SCRAPER_PAYLOAD } from "../../../../lib/constants/interview-prep/index.js";
import { splitInHalf } from "../../../../lib/helpers/index.js";
import { processJobListings } from "../../../db/services/job-listing.js";
import { closeDB } from "../../../db/index.js";

async function runLinkedInJobListing() {
  try {
    const jobsList = await runLinkenInScrapper(RUN_LINKEDIN_SCRAPER_PAYLOAD);
    const filteredJobs = await processJobListings(jobsList);
    if (!filteredJobs.length) return console.log("No Jobs Found 😐!!!");
    if (filteredJobs.length > 20) {
      const [firstHalf, secondHalf] = splitInHalf(filteredJobs) as any;
      await sendTelegramJobListing(firstHalf, { src: "LinkedIn" });
      await sendTelegramJobListing(secondHalf, { src: "LinkedIn" });
      return;
    }
    await sendTelegramJobListing(filteredJobs, { src: "LinkedIn" });
  } catch (error) {
    console.log("run job listing error : ", (error as Error).message);
  } finally {
    await closeDB();
  }
}

runLinkedInJobListing();
