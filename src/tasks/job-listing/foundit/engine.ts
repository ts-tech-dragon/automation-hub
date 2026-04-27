import "dotenv/config";
import { RUN_FOUNDIT_SCRAPPER_PAYLOAD } from "../../../../lib/constants/interview-prep/index.js";
import { buildFounditSearchUrl } from "../../../../lib/helpers/interview-prep/index.js";
import { applyToFoundItJobs } from "./apply.js";

const runFounitApply = async () => {
  const urls: string[] = RUN_FOUNDIT_SCRAPPER_PAYLOAD.jobCities.map((loc) => {
    return buildFounditSearchUrl({
      query: RUN_FOUNDIT_SCRAPPER_PAYLOAD.query,
      location: loc,
    });
  });

  for (let founitURL of urls) {
    await applyToFoundItJobs(founitURL);
    console.log("Applied Successfully ");
  }
};

runFounitApply().catch((err) => {
  console.error("Fatal Runner Error:", err.message);
  process.exit(1);
});
