import dotenv from "dotenv/config";
import { getHrMailIdFromSearchAPIResponse } from "../../../../lib/helpers/job-listing/index.js";
import { getSearchAPIResults } from "../../../core/searchapi_io.js";
import { jsearchFetcher } from "./jSearchFetcher.js";
import {
  JSEARCH_MOCK_RESULTS,
  SEARCH_API_HR_RESULTS_MOCK,
} from "../../../../lib/constants/job-listing/mock.js";
import type { JobDataResponse } from "../../../../types/index.js";
import { RUN_JSEARCH_SCRAPPER_PAYLOAD } from "../../../../lib/constants/job-listing/index.js";
import { processJobListings } from "../../../db/services/job-listing.js";
import { closeDB } from "../../../db/index.js";
import { splitInHalf } from "../../../../lib/helpers/index.js";
import { sendTelegramJobListing } from "../../../core/notifier/telegram.js";

const runJsearchEngine = async (query: string) => {
  try {
    const jsearchResults: (JobDataResponse & { keyword: string })[] =
      await jsearchFetcher(query);

    //   const jsearchResults =  JSEARCH_MOCK_RESULTS;

    // const jsearchResultPromises = jsearchResults.map(async (item) => {
    //   const searchAPIResults = await getSearchAPIResults(
    //     item?.keyword as string,
    //   );
    //   // const searchAPIResults = SEARCH_API_HR_RESULTS_MOCK;

    //   const mailId = getHrMailIdFromSearchAPIResponse(
    //     searchAPIResults,
    //     item?.company as string,
    //   );

    //   if (mailId) item["mail"] = mailId;

    //   return item;
    // });

    // const santizedResults = await Promise.all(jsearchResultPromises);

    const filteredJobs = await processJobListings(jsearchResults);
    if (!filteredJobs.length) {
      return console.log("No Jobs Found 😐!!!");
    }
    if (filteredJobs.length > 20) {
      const [firstHalf, secondHalf] = splitInHalf(filteredJobs) as any;
      await sendTelegramJobListing(firstHalf, {
        src: "Jsearch",
        loc: query.split(" ")[3] as string,
      });
      await sendTelegramJobListing(secondHalf, {
        src: "Jsearch",
        loc: query.split(" ")[3] as string,
      });
      return;
    }
    await sendTelegramJobListing(filteredJobs, {
      src: "Jsearch",
      loc: query.split(" ")[3] as string,
    });
  } catch (error) {
    console.error("Error in runJsearchEngine:", (error as Error).message);
  } finally {
    await closeDB();
  }
};

const mainJsearchRunner = async () => {
  for (const keyword of RUN_JSEARCH_SCRAPPER_PAYLOAD.keywords) {
    await runJsearchEngine(keyword);
  }
};

mainJsearchRunner();
