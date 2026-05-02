import "dotenv/config";
import { RUN_SHINE_SCRAPPER_PAYLOAD } from "../../../../lib/constants/interview-prep/index.js";
import runApplyShine from "./apply.js";

const runShineEngine = async () => {
  const urlArr: string[] = [];
  RUN_SHINE_SCRAPPER_PAYLOAD.jobCities.forEach((city) => {
    const url = `https://www.shine.com/job-search/react-dot-js-html5-javascript-jobs-in-${city.loc}?q=react-dot-js-html5-javascript&qActual=react+dot+js+html5+javascript&loc=Bangalore&location=${city.code}&fexp=2&fexp=3`;
    urlArr.push(url);
  });

  try {
    for (const url of urlArr) {
      await runApplyShine(url);
    }
  } catch (error) {
    console.log("runShineEngine error : ", (error as Error).message);
  }
};

runShineEngine();
