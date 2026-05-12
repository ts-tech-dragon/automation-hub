import "dotenv/config";
import { sendTelegramJobListing } from "../../../core/notifier/telegram.js";
import { MOCK_INTERVIEW_JOBS } from "../../../../lib/constants/job-listing/mock.js";
import { runScrapeIndeed } from "./indeed-scrapper.js";
import { RUN_INDEED_SCRAPER_PAYLOAD } from "../../../../lib/constants/interview-prep/index.js";
import { splitInHalf } from "../../../../lib/helpers/index.js";
import { processJobListings } from "../../../db/services/job-listing.js";
import { closeDB } from "../../../db/index.js";

async function runJobListing() {
  try {
    const locations = RUN_INDEED_SCRAPER_PAYLOAD.locations;
    for (const location of locations) {
      const jobsList = await runScrapeIndeed(
        RUN_INDEED_SCRAPER_PAYLOAD,
        location,
      );
      // const jobsList = MOCK_INTERVIEW_JOBS as any;
      const filteredJobs = await processJobListings(jobsList);
      if (!filteredJobs.length) {
        console.log("No Jobs Found 😐!!!");
        continue;
      }
      if (filteredJobs.length > 20) {
        const [firstHalf, secondHalf] = splitInHalf(filteredJobs) as any;
        await sendTelegramJobListing(firstHalf, {
          src: "Indeed",
          loc: location,
        });
        await sendTelegramJobListing(secondHalf, {
          src: "Indeed",
          loc: location,
        });
        return;
      }
      await sendTelegramJobListing(filteredJobs, {
        src: "Indeed",
        loc: location,
      });
    }
  } catch (error) {
    console.log("run job l6isting error : ", (error as Error).message);
  } finally {
    await closeDB();
  }
}

runJobListing();
