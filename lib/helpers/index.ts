/**
 * Removes any HTML tags that Telegram doesn't support
 */
export const sanitizeForTelegram = (text: string) => {
  // 1. Remove unsupported tags like <div>, <p>, <span> but keep <b>, <i>, <code>, <pre>, <tg-spoiler>
  return (
    text
      .replace(
        /<(?!(\/?(b|i|code|pre|tg-spoiler|a|u|s|ins|del|em|strong)))\b[^>]*>/gi,
        "",
      )
      // 2. Ensure basic character escaping for safety
      .replace(/&(?!(amp|lt|gt|quot|apos);)/g, "&amp;")
  );
};
