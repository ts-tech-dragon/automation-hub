import path from "node:path";
import fs from "node:fs";

export const ENV_VARS = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  PUTER_API_KEY: process.env.PUTER_API_KEY || "",
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "",
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || "",
  MARKETAUX_API_KEY: process.env.MARKETAUX_API_KEY || "",
  MOCK_GEMINI: process.env.MOCK_GEMINI || "true",

  //Facebook Instagram Threads
  IG_USER_TOKEN: process.env.IG_USER_TOKEN,
  FB_USER_TOKEN: process.env.FB_USER_TOKEN,
  TH_USER_TOKEN: process.env.TH_USER_TOKEN,

  FB_PAGE_ID: process.env.FB_PAGE_ID,
  IG_USER_ID: process.env.IG_USER_ID,
  TH_USER_ID: process.env.TH_USER_ID,

  //IMGBB
  IMGBB_API_KEY: process.env.IMGBB_API_KEY,
  //Discord
  DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
  DISCORD_INTERVIEW_PREP_URL: process.env.DISCORD_INTERVIEW_PREP_URL,
  DISCORD_ERROR_LOGS_URL: process.env.DISCORD_ERROR_LOGS_URL,
  FOUNDIT_STORAGE_JSON: "FOUNDIT_STORAGE_JSON",
  SHINE_STORAGE_JSON: "SHINE_STORAGE_JSON",
  //MONGODB
  MONGODB_URI: process.env.MONGODB_URI,
  //MARKET PULSE
  MARKET_AUX_API_KEY: process.env.MARKET_AUX_API_KEY,
};

export const GEMINI_MODELS = {
  // ⚡ The "Workhorses" (High Quota: ~1,500 to 2,500 RPD)
  FLASH_LITE_3_1: "gemini-3.1-flash-lite-preview", // Best for very high volume
  FLASH_2_5: "gemini-2.5-flash", // Reliable stable version

  // 🧠 The "Thinkers" (High Quality, Low Quota)
  PRO_3_1: "gemini-3.1-pro-preview", // Deep reasoning, best for complex logic
  FLASH_3: "gemini-3-flash-preview", // The latest frontier flash model

  // 🖼️ The "Artists" (Specialized)
  IMAGE_3_1: "gemini-3.1-flash-image-preview", // For vision/image tasks
  LIVE_3_1: "gemini-3.1-flash-live-preview", // For real-time audio/voice

  // 🏎️ The "Speedsters" (1,000 Requests/Day)
  LITE_2_5: "gemini-2.5-flash-lite",
  FLASH_IMAGE_2_5: "gemini-2.5-flash-image",
} as const;

export const PUTER_MODELS = {
  GPT_1_5: "gpt-image-1.5", //→ Best quality (OpenAI style)
  GEMINI_3_PRO_IMAGE: "gemini-3-pro-image", // → Nano Banana (very good)
  GROK_2_IMAGE: "grok-2-image", // → xAI Grok image
  FLUX_1_1_PRO: "flux-1.1-pro", // → Excellent for realistic/infographics
} as const;

// 💡 Helper to pick the best model for the situation
export const DEFAULT_GEMINI_MODEL = GEMINI_MODELS.FLASH_2_5;

export const INSTA_PAGE_NAME = process.env.INSTA_PAGE_NAME;

export const API_URLS = {
  MARKET_AUX_NEWS: "https://api.marketaux.com/v1/news/all",
};

// 1. Convert local icons to Base64 strings
// Adjust these paths based on where your script is running from
const fbIconPath = path.join(process.cwd(), "assets/icons/fb_icon.png");
const igIconPath = path.join(process.cwd(), "assets/icons/ig_icon.png");
const thIconPath = path.join(process.cwd(), "assets/icons/th_icon.png");

const fbBase64 = fs.readFileSync(fbIconPath).toString("base64");
const igBase64 = fs.readFileSync(igIconPath).toString("base64");
const thBase64 = fs.readFileSync(thIconPath).toString("base64");

export const TSFINNEWS_ICONS = {
  facebook: fbBase64,
  instagram: igBase64,
  threads: thBase64,
};
