import "dotenv/config";
import { getMarketData, getWeeklyOHLC } from "./fetcher.js";
import { main as getGeminiSummary } from "./summarizer.js"; // Adjust based on your export
import { createStockPost } from "./image-gen.js";
import { sendTelegramStockImage } from "../../core/notifier/telegram.js";
import { fetchIndianMarketNews } from "./newsFetcher.js";
import { generateStockSummaryImage } from "./generator.js";
import { mockGeminiSummaryResponse } from "../../../lib/constants/mockData.js";
import { broadcastUpdate } from "../../core/social/facebook.js";
import { generateProfessionalSlide } from "../../../lib/gen-image-drawer/dailyNiftyPost.js";
import { isMarketHoliday } from "../../../lib/helpers/insta-earning-results/index.js";

async function runWorkflow() {
  const isHoliday = isMarketHoliday();
  if (isHoliday) return null;
  try {
    console.log("📈 Fetching Live Market Data...");
    const marketData = await getMarketData();

    const newsHeadlines = await fetchIndianMarketNews();
    console.log("🤖 Gemini is writing the headline...");
    // 💡 IMPORTANT: Now 'content' will actually contain the data!
    const content = await getGeminiSummary(marketData, newsHeadlines);

    // const content = mockGeminiSummaryResponse; // Using mock data for testing

    if (!content || !content.headline) {
      throw new Error("Gemini returned empty content");
    }

    // console.log(`🎨 Generating Instagram Post for: ${content.headline}`);
    const imagePath = await generateProfessionalSlide(content);
    // const imagePath = (await generateStockSummaryImage(
    //   marketData,
    //   newsHeadlines,
    //   content,
    // )) as string;

    if (imagePath) {
      console.log(`✅ Success! Temp image created.`);
      await broadcastUpdate(imagePath, content);
      await sendTelegramStockImage(content, imagePath);
      return;
    }
    console.log("Image Path is not created!!!");
  } catch (err) {
    console.error("❌ Workflow failed:", err);
  }
}

runWorkflow();
