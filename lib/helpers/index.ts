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

export const extractJson = (text: string) => {
  try {
    // Finds the first '{' and the last '}'
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) throw new Error("No JSON found");

    const jsonStr = text.substring(start, end + 1);
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error(
      "❌ Extraction Failed. Raw text sample:",
      text.substring(0, 100),
    );
    throw e;
  }
};
