import { Telegram } from "telegraf";
import { sanitizeForTelegram } from "../../../lib/helpers/index.js";
import { ENV_VARS } from "../../../lib/constants/index.js";

// Initialize the Telegram client
const tg = new Telegram(ENV_VARS.TELEGRAM_BOT_TOKEN);

export async function sendTelegramInterview(title: string, content: string) {
  try {
    const cleanContent = sanitizeForTelegram(content);
    const message = `<b>🚀 ${title}</b>\n\n${cleanContent}`;

    // 💡 If message is still too long, we split it manually
    if (message.length > 4000) {
      console.log("📏 Message too long, splitting...");
      const part1 = message.substring(0, 4000);
      const part2 = message.substring(4000);
      await tg.sendMessage(ENV_VARS.TELEGRAM_CHAT_ID, part1, {
        parse_mode: "HTML",
      });
      await tg.sendMessage(ENV_VARS.TELEGRAM_CHAT_ID, part2, {
        parse_mode: "HTML",
      });
    } else {
      await tg.sendMessage(ENV_VARS.TELEGRAM_CHAT_ID, message, {
        parse_mode: "HTML",
      });
    }

    console.log(`✅ Sent: ${title}`);
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
