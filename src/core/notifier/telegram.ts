import { Telegram } from "telegraf";
import { ENV_VARS } from "../../../lib/constants/index.js";

// Initialize the Telegram client
const tg = new Telegram(ENV_VARS.TELEGRAM_BOT_TOKEN);

export async function sendTelegramInterview(title: string, content: string) {
  try {
    // 💡 Formatting tip: We wrap content in <pre> to handle code-heavy Gemini text
    const message = `<b>🚀 ${title}</b>\n\n${content}`;

    await tg.sendMessage(ENV_VARS.TELEGRAM_CHAT_ID, message, {
      parse_mode: "HTML",
    });

    console.log("📬 Telegraf: Interview material sent!");
  } catch (error) {
    // Telegraf provides excellent error messages automatically
    console.error("❌ Telegraf Error:", (error as Error).message);

    // Fallback: If HTML parsing fails, send as plain text
    if ((error as Error).message.includes("can't parse entities")) {
      console.log("⚠️ HTML parsing failed, retrying in plain text...");
      await tg.sendMessage(
        ENV_VARS.TELEGRAM_CHAT_ID,
        `🚀 ${title}\n\n${content}`,
      );
    }
  }
}
