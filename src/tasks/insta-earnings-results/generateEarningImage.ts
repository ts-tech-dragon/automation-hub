import fs from "node:fs";
import path from "node:path";
import { scrapperBrowser } from "../../core/scrapper/index.js";
import { uploadBufferToImgBB } from "../../core/imgbb.js";
import { NIFTY_50_STOCKS } from "../../../lib/constants/insta-earning-results/index.js";
import { EARNINGS_POST_THEMES } from "../../../lib/constants/theme.js";

// ... inside your generateEarningsImage function

// 1. Convert local icons to Base64 strings
// Adjust these paths based on where your script is running from
const fbIconPath = path.join(process.cwd(), "assets/icons/fb_icon.png");
const igIconPath = path.join(process.cwd(), "assets/icons/ig_icon.png");
const thIconPath = path.join(process.cwd(), "assets/icons/th_icon.png");

const fbBase64 = fs.readFileSync(fbIconPath).toString("base64");
const igBase64 = fs.readFileSync(igIconPath).toString("base64");
const thBase64 = fs.readFileSync(thIconPath).toString("base64");

// Randomly pick a theme
const activeTheme: any =
  EARNINGS_POST_THEMES[Math.floor(Math.random() * EARNINGS_POST_THEMES.length)];

export async function generateEarningsImage(
  data: {
    name: string;
    marketCap: string;
    eps: string;
    isNifty?: boolean;
    symbol: string;
  }[],
  isEPSRequired: boolean,
) {
  const { page, context, browser } = await scrapperBrowser();
  try {
    const dateStr = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    if (isEPSRequired) {
      data = data.filter((item) => {
        if (Boolean(item.eps)) return item;
      });
    }

    data.forEach((item, i) => {
      const isNifty = NIFTY_50_STOCKS.constituents.some((stock) => {
        return stock.symbol === item.symbol;
      });

      if (isNifty) {
        item["isNifty"] = true;
      } else {
        item["isNifty"] = false;
      }
    });

    // 1. Create the HTML Template with Tailwind CSS for styling
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        :root {
        --primary-rgb: ${activeTheme.primary};
        --secondary-rgb: ${activeTheme.secondary};
        --accent-rgb: ${activeTheme.accent};
        --header-gradient: ${activeTheme.gradient};
        }

        * { box-sizing: border-box; }
        
        body {
          font-family: 'Inter', sans-serif;
          background: radial-gradient(ellipse at 20% 20%, #0d2137 0%, #0a0f1e 40%, #050810 100%);
          color: white;
          margin: 0; /* Important: Remove default body margins */
          padding: 0;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* This wrapper now ensures the content fills the 1080px (or whatever) height */
        .outer-wrapper {
          width: 100%;
          min-height: 100vh;
          padding: 0; /* Remove padding to go full-bleed */
          display: flex;
        }

        .glass-card {
          width: 100%; /* Take full width */
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);
          border: none; /* Removed border to make it look like a background */
          backdrop-filter: blur(24px);
          box-shadow: inset 0 0 100px rgba(0,0,0,0.5); /* Adds depth to the edges */
        }

        .header-glass {
          background: var(--header-gradient);
          border-bottom: 1px solid rgba(var(--primary-rgb), 0.2);
          position: relative;
          overflow: hidden;
        }

        .header-glass::before {
          content: '';
          position: absolute;
          top: -60%; left: 50%;
          transform: translateX(-50%);
          width: 70%; height: 120%;
          background: radial-gradient(ellipse, rgba(var(--primary-rgb), 0.15) 0%, transparent 70%);
        }

        .title-glow {
          text-shadow:
            0 0 20px rgba(var(--primary-rgb), 0.6),
            0 0 40px rgba(var(--primary-rgb), 0.3);
        }

        .date-pill {
          background: rgba(var(--primary-rgb), 0.1);
          border: 1px solid rgba(var(--primary-rgb), 0.25);
          color: var(--accent-rgb);
          border-radius: 999px; padding: 4px 20px; font-size: 0.85rem;
        }

        thead th {
          color: rgba(var(--primary-rgb), 1);
          border-bottom: 1px solid rgba(var(--primary-rgb), 0.2);
          font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
        }

        .divider {
          background: linear-gradient(to bottom, transparent, rgba(var(--primary-rgb), 0.2) 20%, rgba(var(--primary-rgb), 0.2) 80%, transparent);
        }

        .nifty-badge {
          background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.2), rgba(var(--primary-rgb), 0.08));
          border: 1px solid rgba(var(--primary-rgb), 0.35);
        }
      </style>
    </head>
    <body class="bg-[#050810]">
      <div class="outer-wrapper flex items-start justify-center">
        <div class="glass-card" style="border-radius: 20px; overflow: hidden;">

          <div class="header-glass" style="padding: 32px; text-align: center;">
            <div style="position: relative; z-index: 1;">
              <h1 class="title-glow" style="font-size: 2.5rem; font-weight: 800; color: rgba(var(--primary-rgb), 1); letter-spacing: 0.06em; text-transform: uppercase; margin: 0 0 12px;">
                Daily Upcoming Earnings
              </h1>
              <div class="date-pill">
                <span style=" font-weight: 600;font-size:1.25rem">${dateStr}</span>
              </div>
            </div>
          </div>

          <div style="width: 100%; overflow-x: auto;">
            <table style="table-layout: auto; width: 100%;"> 
            <thead>
                <tr>
                  <th style="text-align: left; padding-left: 32px;font-size:24px">Company Name</th>
                  <th style="text-align: right;;font-size:16px">Market Cap (Cr)</th>
                  ${isEPSRequired ? '<th style="text-align: right;font-size:16px">EPS</th>' : ""}
                  <th style="text-align: center; padding-right: 32px;font-size:16px">N50</th>
                </tr>
              </thead>
              <tbody>
                ${data
                  .map(
                    (stock, index) => `
                  <tr class="${index % 2 === 0 ? "" : "row-alt"}" style="height: 60px; padding: 24px 20px; vertical-align: middle;">
                    <td class="company-name" style="padding-left: 32px;font-size:24px">${stock.name}</td>
                    <td style="text-align: right;font-size:24px">
                      <span style="display: inline-flex; align-items: center; gap: 8px; justify-content: flex-end;">
                        <span class="rupee-badge">₹</span>
                        <span class="mono-val">${stock.marketCap}</span>
                      </span>
                    </td>
                    ${
                      isEPSRequired
                        ? `
                    <td style="text-align: right;font-size:24px">
                      <span style="display: inline-flex; align-items: center; gap: 8px; justify-content: flex-end;">
                        <span class="rupee-badge">₹</span>
                        <span class="mono-val">${stock.eps}</span>
                      </span>
                    </td>`
                        : ""
                    }
                    <td style="font-size:24px">
                      <div class="nifty-cell" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                        ${stock.isNifty ? '<span class="nifty-badge">✅</span>' : ""}
                      </div>
                    </td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="footer-glass" style="display: flex; align-items: center; justify-content: center; gap: 24px;">
            <div class="footer-item flex items-center gap-2">
              <img src="data:image/png;base64,${fbBase64}" style="width:16px;height:16px;" />
              <span>tsfinnews</span>
            </div>
            
            <div class="footer-item flex items-center gap-2">
              <img src="data:image/png;base64,${igBase64}" style="width:16px;height:16px;" />
              <span>@tsfinnews</span>
            </div>

            <div class="footer-item flex items-center gap-2">
              <img src="data:image/png;base64,${thBase64}" style="width:16px;height:16px;" />
              <span>tsfinnews</span>
            </div>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;

    // 2. Load the HTML into the page
    await page.setContent(htmlContent);

    // 3. Take a screenshot of the specific element
    const container = await page.locator("body");
    const imageBuffer = await container.screenshot({
      type: "jpeg", // Change this from default 'png'
      animations: "disabled",
      omitBackground: true, // Makes the edges clean if you want to overlay it
    });

    console.log("📸 Screenshot captured in memory. Uploading directly...");
    // 2. Upload the buffer and get the URL
    const imageUrl = await uploadBufferToImgBB(imageBuffer);

    console.log(`🔗 Success! Image URL: ${imageUrl}`);
    return imageUrl;
  } catch (error) {
    console.log("generateEarningsImage error : ", (error as Error).message);
    return "";
  } finally {
    await page?.close().catch(() => {});
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
  }
}
