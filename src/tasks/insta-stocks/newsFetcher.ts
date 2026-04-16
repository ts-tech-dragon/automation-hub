import axios from "axios";
import dayjs from "dayjs";
import { API_URLS, ENV_VARS } from "../../../lib/constants/index.js";
import { formatNewsForAI } from "../../../lib/helpers/index.js";

const API_KEY = ENV_VARS.MARKETAUX_API_KEY;

export async function fetchIndianMarketNews() {
  try {
    // ⏱️ Get time window (last 18 hours)
    const from = dayjs().subtract(18, "hour").format("YYYY-MM-DDTHH:mm");
    const to = dayjs().format("YYYY-MM-DDTHH:mm");

    const url = API_URLS.MARKET_AUX_NEWS;

    const response = await axios.get(url, {
      params: {
        api_token: API_KEY,
        countries: "in", // 🇮🇳 India filter
        language: "en",
        published_after: from,
        published_before: to,
        limit: 20,
        sort: "published_desc",

        // 🔥 IMPORTANT: filter meaningful topics
        filter_entities: true,
        industries: "Financials,Energy,Technology",
      },
    });

    const news = response.data.data;

    // 🧠 Filter only useful “market-moving” news
    const filtered = news
      .filter((item: { title: string }) => {
        const title = item.title.toLowerCase();

        return (
          title.includes("earnings") ||
          title.includes("profit") ||
          title.includes("order") ||
          title.includes("deal") ||
          title.includes("stake") ||
          title.includes("government") ||
          title.includes("policy") ||
          title.includes("rbi") ||
          title.includes("inflation")
        );
      })
      .slice(0, 5); // keep top 5 for Instagram
    return formatNewsForAI(filtered);
  } catch (error) {
    console.error("Error fetching news:", (error as Error).message);
    return ""; // Return empty string on failure to avoid breaking Gemini prompt
  }
}
