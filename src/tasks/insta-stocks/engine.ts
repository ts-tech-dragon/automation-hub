import "dotenv/config";
import { getMarketData } from "./fetcher.js";
import { main as getGeminiSummary } from "./summarizer.js"; // Adjust based on your export
import { createStockPost } from "./image-gen.js";
import { sendTelegramStockImage } from "../../core/notifier/telegram.js";

async function runWorkflow() {
  try {
    console.log("📈 Fetching Live Market Data...");
    const marketData = await getMarketData();

    const newsHeadlines = `Nifty reclaimed 24,150; Sensex jumps 1,160 pts. Railtel surged 13%. US-Iran peace talks cool oil prices.`;

    console.log("🤖 Gemini is writing the headline...");
    // 💡 IMPORTANT: Now 'content' will actually contain the data!
    const content = await getGeminiSummary(marketData, newsHeadlines);

    if (!content || !content.headline) {
      throw new Error("Gemini returned empty content");
    }

    console.log(`🎨 Generating Instagram Post for: ${content.headline}`);
    const imagePath = await createStockPost(content.headline, content.points);

    console.log(`✅ Success! Temp image created.`);
    await sendTelegramStockImage(content, imagePath);
  } catch (err) {
    console.error("❌ Workflow failed:", err);
  }
}

runWorkflow();
