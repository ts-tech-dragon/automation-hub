import { Telegram } from "telegraf";
import { formatJob, sanitizeForTelegram } from "../../../lib/helpers/index.js";
import { ENV_VARS } from "../../../lib/constants/index.js";
import { message } from "telegraf/filters";
import { ComputeTokensResponse } from "@google/genai";

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
        { parse_mode: "Markdown" },
      );
    }
  }
}

export const sendTelegramStockImage = async (
  content: any,
  imagePath: string,
  url?: boolean,
) => {
  const path = url ? { url: imagePath } : { source: imagePath };
  try {
    // 📤 NEW: Send the image to Telegram
    console.log("📤 Sending slide to Telegram...");
    await tg.sendPhoto(ENV_VARS.TELEGRAM_CHAT_ID, path, {
      caption: `<b>${content.headline}</b>\n\n${content.caption}`,
      parse_mode: "HTML",
    });

    console.log("✅ Stock update sent to your phone!");
  } catch (error) {
    console.error("❌ Telegraf Error:", (error as Error).message);
  }
};

export const sendTelegramJobListing = async (
  message: { title: string; company: string; location: string; link: string }[],
  base: { src: string; loc?: string },
) => {
  const { src, loc } = base;
  try {
    console.log("Message Length : ", message.length);

    // 📤 NEW: Send the image to Telegram
    console.log("📤 Sending job listing to Telegram...");

    let formattedMessage = `💼 New ${src} Job Listing for ${loc ?? ""}\n`;

    formattedMessage += message.map(formatJob).join("------------------");

    await tg.sendMessage(ENV_VARS.TELEGRAM_CHAT_ID, formattedMessage, {
      parse_mode: "Markdown",
    });

    console.log("✅ Job listing sent to your phone!");
  } catch (error) {
    console.error("❌ Telegraf Error:", (error as Error).message);
  }
};

export async function sendNSEResultTelegramNotification(
  formattedMsg: string,
  pdfUrl: string,
) {
  try {
    // Convert Markdown-ish to HTML for Telegram
    const htmlMsg =
      formattedMsg.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/•/g, "▫️") +
      `\n\n📄 <a href="${pdfUrl}">View Full Report</a>`;

    await tg.sendMessage(ENV_VARS.TELEGRAM_CHAT_ID, htmlMsg, {
      parse_mode: "HTML",
    });
  } catch (error) {
    console.error("❌ Telegraf Error:", (error as Error).message);
  }
}
