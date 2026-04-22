import { scrollToLoad } from "../../../../lib/helpers/interview-prep/index.js";
import { scrapperBrowser } from "../../../core/scrapper/index.js";
import type { RUN_LINKEDIN_SCRAPER_PAYLOAD } from "../../../../lib/constants/interview-prep/index.js";

const runLinkenInScrapper: (
  option: typeof RUN_LINKEDIN_SCRAPER_PAYLOAD,
) => Promise<any[]> = async (options) => {
  const locations = options.locations || ["Chennai", "Coimbatore", "Bangalore"];
  const keywords = options.keywords || "Front End Developer React js";
  const maxResults = options.maxResults || 200;

  const combinedKeywords = `${keywords} (${locations.join(" OR ")})`;
  const baseUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(combinedKeywords)}&f_AL=true&f_TPR=r604800`;

  const { browser, context, page } = await scrapperBrowser();

  try {
    // 🔍 Check login
    await page.goto("https://www.linkedin.com/feed/", {
      waitUntil: "domcontentloaded",
    });

    const anchorsMap = new Map();

    for (let start = 0; anchorsMap.size < maxResults; start += 25) {
      const pageUrl = `${baseUrl}&start=${start}`;
      console.log(`\n--- Searching LinkedIn page: ${start} ---`);

      try {
        await page.goto(pageUrl, { waitUntil: "networkidle", timeout: 20000 });
      } catch {
        console.log(`⚠️ Timeout at page ${start}, stopping...`);
        break;
      }

      await scrollToLoad(page);

      const jobCards = await page.locator(".scaffold-layout__list-item").all();
      console.log(`Found ${jobCards.length} cards`);

      let newFoundOnPage = 0;

      for (const card of jobCards) {
        if (anchorsMap.size >= maxResults) break;

        try {
          await card.click();

          // ✅ Wait for right panel properly (no hard timeout)
          const rightPanel = page.locator(
            ".jobs-search__job-details--container",
          );

          await rightPanel.waitFor({ timeout: 5000 });

          const easyApplyBtn = rightPanel
            .getByRole("button", { name: /Easy Apply/i })
            .first();

          const isEasyApply = await easyApplyBtn.isVisible();
          const btnText = isEasyApply ? await easyApplyBtn.innerText() : "";

          const locationText = await rightPanel.innerText().catch(() => "");

          const normalizedText = locationText.toLowerCase();

          const isLocationMatch = locations.some((loc) =>
            normalizedText.includes(loc.toLowerCase()),
          );

          if (isEasyApply && !btnText.includes("Applied") && isLocationMatch) {
            const location = await page
              .locator(
                ".job-details-jobs-unified-top-card__tertiary-description-container span.tvm__text--low-emphasis",
              )
              .first()
              .innerText()
              .catch(() => "");

            const isExactLocation = locations.some((loc) =>
              normalizedText.toLocaleLowerCase().includes(loc.toLowerCase()),
            );

            if (!isExactLocation) continue;

            const jobTitle = await rightPanel
              .locator(".job-details-jobs-unified-top-card__job-title")
              .first()
              .innerText();
            const companyName = await rightPanel
              .locator(".job-details-jobs-unified-top-card__company-name")
              .first()
              .innerText();

            const jobLink = await page.url();
            const jobId = new URL(jobLink).searchParams.get("currentJobId");

            if (!anchorsMap.has(jobLink)) {
              anchorsMap.set(jobLink, {
                title: jobTitle.trim(),
                company: companyName.trim(),
                location,
                link: `https://www.linkedin.com/jobs/view/${jobId}/`,
              });

              newFoundOnPage++;
              console.log(`✅ ${jobTitle} @ ${companyName}`);
            }
          }
        } catch (err) {
          console.log("❌ Card error:", (err as Error).message);
        }
      }

      if (newFoundOnPage === 0) {
        console.log("🛑 No new jobs found, stopping...");
        break;
      }
    }

    return Array.from(anchorsMap.values());
  } catch (error) {
    console.log("❌ Scraper error:", (error as Error).message);
    return [];
  } finally {
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
  }
};

export default runLinkenInScrapper;
