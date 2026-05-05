import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import "dayjs/locale/en";

dayjs.locale("en");
// Extend dayjs with the plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export const getTimeInIST = (formate = "DD-MM-YYYY") => {
  // Set the date specifically to IST
  const formattedDate = dayjs().tz("Asia/Kolkata").format(formate);
  return formattedDate;
};

export function isAfter6PMInIST() {
  // Get the current time in IST
  const nowInIST = dayjs().tz("Asia/Kolkata");

  // Create a comparison object for 6:00 PM (18:00) today in IST
  const sixPM = nowInIST.hour(18).minute(0).second(0).millisecond(0);

  // Return true if now is after 6:00 PM
  return nowInIST.isAfter(sixPM);
}

export function isAfter330PMInIST() {
  // Get the current time in IST
  const nowInIST = dayjs().tz("Asia/Kolkata");

  // Create a comparison object for 6:00 PM (18:00) today in IST
  const three_thirty_pm = nowInIST.hour(18).minute(0).second(0).millisecond(0);

  // Return true if now is after 6:00 PM
  return nowInIST.isAfter(three_thirty_pm);
}

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

export function formatNewsForAI(newsList: { title: string }[]) {
  return newsList
    .map((item, index) => {
      return `${index + 1}. ${item.title}`;
    })
    .join("\n");
}

export function measureTextHeight(
  ctx: any,
  text: string,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let lines = 1;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      line = words[n] + " ";
      lines++;
    } else {
      line = testLine;
    }
  }
  return lines * lineHeight;
}

export const getFormatedTodayDate = () => {
  const now = new Date();

  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(now)
    .replace(/\//g, "-");
  return formattedDate;
};

export function repairJSON(raw: string) {
  try {
    // Try normal parse first
    return JSON.parse(raw);
  } catch (e) {}

  let fixed = raw;

  // ✅ Convert single quotes → double quotes
  fixed = fixed.replace(/'/g, '"');

  // ✅ Add quotes to keys
  fixed = fixed.replace(/(\w+):/g, '"$1":');

  // ✅ Close open quotes
  const quoteCount = (fixed.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    fixed += '"';
  }

  const openCurly = (fixed.match(/{/g) || []).length;
  const closeCurly = (fixed.match(/}/g) || []).length;
  fixed += "}";

  // ✅ Close brackets
  const openBrackets = (fixed.match(/\[/g) || []).length;
  const closeBrackets = (fixed.match(/\]/g) || []).length;
  fixed += "]".repeat(openBrackets - closeBrackets);

  // ✅ Close curly braces
  // const openCurly = (fixed.match(/{/g) || []).length;
  // const closeCurly = (fixed.match(/}/g) || []).length;
  fixed += "}";

  try {
    return JSON.parse(fixed);
  } catch (e) {
    return null;
  }
}

export function escapeHTML(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function isLocationMatch(
  scrapedLocation: string,
  locations: string,
): boolean {
  const normalizedScraped = scrapedLocation.toLowerCase();

  return normalizedScraped.includes(locations.toLowerCase());
}

export function pad(str: string, length: number) {
  return (str || "").padEnd(length, " ").slice(0, length);
}

export function formatJob(job: {
  title: string;
  company: string;
  location: string;
  link: string;
}) {
  return `
🚀 *${job.title}*
🏢 ${job.company}
📍 ${job.location}
⏱ ${dayjs(new Date()).format("DD,MMM,YYYY")}
👉 [Apply Now](${job.link})
`;
}

export function splitInHalf(arr: any[]) {
  const mid = Math.ceil(arr.length / 2);
  return [arr.slice(0, mid), arr.slice(mid)];
}

// Random delay
export const delay = (min = 1000, max = 3000) =>
  new Promise((res) => setTimeout(res, min + Math.random() * (max - min)));

// Human-like mouse movement
export const moveMouseRandomly = async (page: any) => {
  const { width, height } = await page.viewportSize();
  const x = Math.random() * width;
  const y = Math.random() * height;
  await page.mouse.move(x, y, { steps: 10 });
};
