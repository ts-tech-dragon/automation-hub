import path from "node:path";
import { INDEED_SCRAPPER_RESULT_PATH } from "../../../lib/constants/interview-prep/index.js";
import { isLocationMatch } from "../../../lib/helpers/index.js";
import { scrapperBrowser } from "../../core/scrapper/index.js";

// ------------------ CONFIG ------------------
const RESULT_PATH = path.resolve(INDEED_SCRAPPER_RESULT_PATH);
const OUTPUT = path.dirname(RESULT_PATH);

// ------------------ UTIL ------------------

// Random delay
const delay = (min = 1000, max = 3000) =>
  new Promise((res) => setTimeout(res, min + Math.random() * (max - min)));

// Human-like mouse movement
const moveMouseRandomly = async (page: any) => {
  const { width, height } = await page.viewportSize();
  const x = Math.random() * width;
  const y = Math.random() * height;
  await page.mouse.move(x, y, { steps: 10 });
};

// Slow scroll (like reading)
const humanScroll = async (page: any) => {
  const scrollSteps = Math.floor(Math.random() * 5) + 5;

  for (let i = 0; i < scrollSteps; i++) {
    await page.mouse.wheel(0, 300 + Math.random() * 200);
    await delay(800, 2000);

    // Occasionally scroll up
    if (Math.random() < 0.2) {
      await page.mouse.wheel(0, -200);
      await delay(500, 1500);
    }
  }
};

// Parse posted time
const parsePostedTime = (text = "") => {
  text = text.toLowerCase();

  if (text.includes("just posted")) return 1;
  if (text.includes("today")) return 3;

  const num = parseInt(text.match(/\d+/)?.[0] || "0");

  if (text.includes("hour")) return num;
  if (text.includes("day")) return num * 24;

  return 999;
};

// ------------------ SCRAPER ------------------
export const runScrapeIndeed: (
  options?: {
    keyword?: string;
    maxPages?: number;
  },
  locations?: string,
) => Promise<any[]> = async (options = {}, locations) => {
  const keyword = options.keyword || "Frontend Developer React";
  locations = locations ?? "Chennai";
  const maxPages = options.maxPages || 5;

  const { browser, context, page } = await scrapperBrowser();

  // ------------------ WARM-UP ------------------
  console.log("🔥 Warming up session...");

  await page.goto("https://in.indeed.com", {
    waitUntil: "domcontentloaded",
  });

  const jobs = [];
  try {
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      console.log(`\n📄 Page ${pageNum}`);

      await delay(4000, 7000);
      await moveMouseRandomly(page);

      // ------------------ SEARCH ------------------

      const url = `https://in.indeed.com/jobs?q=${encodeURIComponent(keyword)}
                  &l=${encodeURIComponent(locations)}
                  &fromage=1
                  &start=${pageNum * 10}
                  &remotejob=0`;
      console.log("🔎 Searching jobs...");

      await page.goto(url, { waitUntil: "domcontentloaded" });
      await delay(5000, 9000);

      await moveMouseRandomly(page);
      await humanScroll(page);

      // 📸 DEBUG HERE
      await page.screenshot({ path: `debug-${pageNum}.png`, fullPage: true });

      const cards = await page.$$(".tapItem");

      console.log(`Found ${cards.length} jobs`);

      for (const card of cards) {
        try {
          await moveMouseRandomly(page);

          const scrappedLocation = await card
            .$eval(
              '[data-testid="text-location"]',
              (el: { innerText: string }) => el.innerText.trim(),
            )
            .catch(() => "");

          const isLocation = isLocationMatch(scrappedLocation, locations);

          if (!isLocation) continue;

          const title = await card
            .$eval("h2", (el) => el.innerText.trim())
            .catch(() => "");

          const company = await card
            .$eval(
              '[data-testid="company-name"]',
              (el: { innerText: string }) => el.innerText.trim(),
            )
            .catch(() => "");

          const dateText = await card
            .$eval(".date", (el: { innerText: string }) => el.innerText.trim())
            .catch(() => "");

          const postedHoursAgo = parsePostedTime(dateText);

          const link = await card.$eval("a", (el) => el.href).catch(() => "");

          // Simulate reading time
          await delay(1000, 3000);

          jobs.push({
            title,
            company,
            location: locations,
            postedHoursAgo,
            link,
            source: "indeed",
          });

          console.log(`✅ ${title} @ ${company}`);
        } catch (err) {
          console.log("❌ Error parsing job", (err as Error).message);
        }
      }
    }
  } catch (error) {
    console.log("Error : ", (error as Error).message);
  }

  // fs.writeFileSync(RESULT_PATH, JSON.stringify(jobs, null, 2));
  await context.close();
  console.log(`\n🎉 Saved ${jobs.length} jobs`);
  return jobs;
};
