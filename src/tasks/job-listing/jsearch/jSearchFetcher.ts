import axios from "axios";
import { ENV_VARS } from "../../../../lib/constants/index.js";

export const jsearchFetcher = async (query: string) => {
  try {
    const { data } = await axios.get(
      `https://jsearch.p.rapidapi.com/search-v2?query=${encodeURIComponent(query)}&num_pages=1&country=in&date_posted=all`,
      {
        headers: {
          "x-rapidapi-key": ENV_VARS.JSEARCH_API_KEY,
          "x-rapidapi-host": "jsearch.p.rapidapi.com",
        },
      },
    );
    const jobSearchResponse = data.data.jobs;

    const keywords = jobSearchResponse.map(
      (item: {
        employer_name: string;
        job_city: string;
        job_title: string;
        job_location: string;
        job_apply_link: string;
      }) => {
        return {
          keyword: `${item.employer_name} ${item.job_city} hr mail id`,
          company: item.employer_name,
          title: item.job_title,
          location: item.job_location,
          link: item.job_apply_link,
          source: "jsearch",
        };
      },
    );
    return keywords;
  } catch (error) {
    console.error("Error in jsearchFetcher:", (error as Error).message);
    return [];
  }
};
