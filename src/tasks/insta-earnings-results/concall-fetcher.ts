import { sortDataByMarketCap } from "../../../lib/helpers/nse-results/index.js";
import { scrapperBrowser } from "../../core/scrapper/index.js";

export async function concallEarningsFetcher() {
  const { page, context, browser } = await scrapperBrowser();

  const results: any[] = [];

  try {
    console.log("🌐 Navigating to Earnings Calendar...");
    await page.goto("https://concall.in/earnings-calendar/upcoming-results", {
      waitUntil: "networkidle",
    });

    // 1. Find the Today section and the list container (second child logic)
    const todaySection = page
      .locator("h3")
      .filter({ hasText: /Today/i })
      .first();

    try {
      // We explicitly tell Playwright to wait up to 5 seconds.
      // If it finds it, great! The script continues.
      await todaySection.waitFor({ state: "visible", timeout: 5000 });
    } catch (error) {
      // If the 5 seconds run out, it throws the error here instead of crashing your app.
      console.log(
        "⚠️ 'Today' section not found within 5 seconds. No earnings today. Exiting gracefully.",
      );
      return []; // Exit the function cleanly and return your empty array
    }
    const parentElement = todaySection.locator("..");
    const secondChild = parentElement.locator("> *:nth-child(2)");

    // 2. Get all stock links as a list of Locators
    const stockLinks = await secondChild.locator("a").all();
    console.log(
      `📊 Found ${stockLinks.length} stocks. Starting deep scrape...`,
    );

    const scrapeData = async () => {
      // 3. Loop through each stock
      for (const link of stockLinks) {
        //   const name = (await link.innerText()).trim();
        // If rawName is null/undefined, it defaults to ""
        const rawName = (await link.innerText()) ?? "";
        let name = rawName;
        let eps = "";

        // Now you don't need '?' and the error disappears
        if (rawName.includes("\n")) {
          const rawNameArr = rawName.split("\n");
          name = rawNameArr[0] as string;
          eps = rawNameArr[1]?.split(" ")[2] as string;
        }
        const relativeHref = await link.getAttribute("href");

        if (!relativeHref) continue;

        // Construct absolute URL (https://concall.in/company/...)
        const fullUrl = new URL(relativeHref, "https://concall.in").href;

        try {
          console.log(`🔍 Fetching Market Cap for: ${name}...`);
          const detailPage = await context.newPage();
          // Open the company analysis page
          await detailPage.goto(fullUrl, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
          });

          // 4. Locate the Market Cap value
          // Usually, financial sites put this in a summary grid.
          // We look for a container containing "Market Cap" and get its sibling/parent text.
          const marketCap = detailPage
            .locator("span")
            .filter({ hasText: /^Market Cap$/i });

          const marketCapParent = marketCap.locator("..");
          const marketCapFirstChild =
            marketCapParent.locator("> *:nth-child(1)");

          // Clean up the string (e.g., "Market Cap ₹1,200 Cr" -> "₹1,200 Cr")
          // FIX 1: Add 'await' here to resolve the string
          const marketCapValue = await marketCapFirstChild.innerText();
          const marketCapValueNUm = parseFloat(
            marketCapValue
              .replace("₹", "")
              .replace("Cr", "")
              .replace(/,/g, "")
              .trim(),
          );

          if (Boolean(marketCapValueNUm < 1000)) {
            // FIX 2: Await the page closure
            await detailPage.close();

            await page.waitForTimeout(500);
            continue;
          }

          await detailPage.locator("[role=tablist] button").first().click();

          const tabPanel = detailPage.locator("[role=tabpanel]").first();

          // This waits until the element is present in DOM AND visible (not hidden)
          await tabPanel.waitFor({ state: "visible", timeout: 5000 });
          let symbol = "";
          const nseContainer = detailPage.getByText("NSE:");
          const isNSEVisible = await nseContainer.isVisible();
          if (isNSEVisible) {
            const nseParentContainer = nseContainer.locator("..");
            symbol = await nseParentContainer
              .locator("span")
              .nth(1)
              .innerText();
          } else {
            // FIX 2: Await the page closure
            await detailPage.close();

            await page.waitForTimeout(500);
            continue;
          }

          if (Boolean(marketCapValueNUm >= 1000)) {
            results.push({ name, marketCap: marketCapValue, eps, symbol });
          }
          // FIX 2: Await the page closure
          await detailPage.close();

          await page.waitForTimeout(500);
        } catch (err) {
          console.error(`⚠️ Failed to get data for :`, (err as Error).message);
          results.push({ name, marketCap: "N/A" });
        }
      }
    };

    //first page scrape
    await scrapeData();

    const nextPage = page.locator('[role="navigation"] ul li').nth(2);
    nextPage.click();
    await page.waitForTimeout(2000); // Wait for the next page to load
    await todaySection.waitFor({ state: "visible", timeout: 5000 });

    //second page scrape
    await scrapeData();
    console.log("✅ Final Scraped Data:", results.length);
    return sortDataByMarketCap(results);
  } catch (err) {
    console.error("❌ Main Task failed:", err);
    return sortDataByMarketCap(results); // Return whatever results we have, even if it's an empty array
  } finally {
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
  }
}
