import axios from "axios";
import { ENV_VARS } from "../../lib/constants/index.js";
export const getSearchAPIResults = async (query: string) => {
  try {
    const { data } = await axios.get(
      `https://www.searchapi.io/api/v1/search?engine=google&q=${encodeURIComponent(query)}&api_key=${ENV_VARS.SEARCHAPI_IO_KEY}`,
    );

    return data.organic_results;
  } catch (error) {
    if ((error as Error).message === "Request failed with status code 429")
      return [];
    console.error(
      "Error fetching search api results:",
      (error as Error).message,
    );
    return [];
  }
};
