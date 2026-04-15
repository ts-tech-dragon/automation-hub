export const ENV_VARS = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "",
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || "",
  MOCK_GEMINI: process.env.MOCK_GEMINI || "true",
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
} as const;

// 💡 Helper to pick the best model for the situation
export const DEFAULT_GEMINI_MODEL = GEMINI_MODELS.FLASH_2_5;

export const INSTA_PAGE_NAME = "@tsfinnews";
