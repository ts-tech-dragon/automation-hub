import axios from "axios";
import { ENV_VARS } from "../../../lib/constants/index.js";
import { getTimeInIST } from "../../../lib/helpers/index.js";

export const getMarketAuxData = async () => {
  const TODAY = getTimeInIST("YYYY-MM-DD", 1);

  try {
    const { data } = await axios.get(
      `https://api.marketaux.com/v1/news/all?countries=in&filter_entities=true&limit=3&published_after=${TODAY}T09:09&api_token=${ENV_VARS.MARKET_PULSE_API_KEY}`,
    );

    return data ?? { data: [] };
  } catch (error) {
    console.error("Error fetching MarketAux data:", (error as Error).message);
    return { data: [] };
  }
};
