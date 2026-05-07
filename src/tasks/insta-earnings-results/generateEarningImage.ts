import fs from "node:fs";
import path from "node:path";
import { scrapperBrowser } from "../../core/scrapper/index.js";
import { uploadBufferToImgBB } from "../../core/imgbb.js";
import { NIFTY_50_STOCKS } from "../../../lib/constants/insta-earning-results/index.js";

// ... inside your generateEarningsImage function

// 1. Convert local icons to Base64 strings
// Adjust these paths based on where your script is running from
const fbIconPath = path.join(process.cwd(), "assets/icons/fb_icon.png");
const igIconPath = path.join(process.cwd(), "assets/icons/ig_icon.png");
const thIconPath = path.join(process.cwd(), "assets/icons/th_icon.png");

const fbBase64 = fs.readFileSync(fbIconPath).toString("base64");
const igBase64 = fs.readFileSync(igIconPath).toString("base64");
const thBase64 = fs.readFileSync(thIconPath).toString("base64");

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
        * { box-sizing: border-box; }
        body {
          font-family: 'Inter', sans-serif;
          background: radial-gradient(ellipse at 20% 20%, #0d2137 0%, #0a0f1e 40%, #050810 100%);
          color: white;
          min-height: 100vh;
        }

        .glass-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow:
            0 0 0 1px rgba(45, 212, 191, 0.08) inset,
            0 32px 64px rgba(0,0,0,0.5),
            0 4px 16px rgba(0,0,0,0.3);
        }

        .header-glass {
          background: linear-gradient(135deg, rgba(45, 212, 191, 0.12) 0%, rgba(56, 189, 248, 0.06) 100%);
          border-bottom: 1px solid rgba(45, 212, 191, 0.2);
          position: relative;
          overflow: hidden;
        }

        .header-glass::before {
          content: '';
          position: absolute;
          top: -60%;
          left: 50%;
          transform: translateX(-50%);
          width: 70%;
          height: 120%;
          background: radial-gradient(ellipse, rgba(45, 212, 191, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .title-glow {
          text-shadow:
            0 0 20px rgba(45, 212, 191, 0.6),
            0 0 40px rgba(45, 212, 191, 0.3),
            0 0 80px rgba(45, 212, 191, 0.15);
        }

        .date-pill {
          display: inline-block;
          background: rgba(45, 212, 191, 0.1);
          border: 1px solid rgba(45, 212, 191, 0.25);
          border-radius: 999px;
          padding: 4px 20px;
          font-size: 0.85rem;
          color: rgba(153, 246, 228, 0.9);
          letter-spacing: 0.08em;
          backdrop-filter: blur(8px);
        }

        thead tr {
          background: linear-gradient(90deg, rgba(45, 212, 191, 0.1) 0%, rgba(45, 212, 191, 0.04) 100%);
        }

        thead th {
          color: rgba(94, 234, 212, 1);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(45, 212, 191, 0.2);
        }

        tbody tr {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          transition: background 0.2s ease;
        }

        tbody tr:hover {
          background: rgba(45, 212, 191, 0.05);
        }

        tbody tr.row-alt {
          background: rgba(255, 255, 255, 0.02);
        }

        tbody tr.row-alt:hover {
          background: rgba(45, 212, 191, 0.06);
        }

        td {
          padding: 14px 20px;
          font-size: 0.92rem;
        }

        .company-name {
          font-weight: 600;
          color: rgba(241, 245, 249, 1);
          letter-spacing: 0.01em;
        }

        .mono-val {
          font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
          font-size: 0.88rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.95);
        }

        .rupee-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(52, 211, 153, 0.25), rgba(16, 185, 129, 0.1));
          border: 1px solid rgba(52, 211, 153, 0.3);
          color: rgba(110, 231, 183, 1);
          font-size: 0.7rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .divider {
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(45, 212, 191, 0.2) 20%, rgba(45, 212, 191, 0.2) 80%, transparent);
          align-self: stretch;
          margin: 8px 0;
        }

        .footer-glass {
          background: linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(15,23,42,0.4) 100%);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding: 16px 24px;
        }

        .footer-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(148, 163, 184, 0.85);
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.03em;
        }

        .footer-item img {
          opacity: 0.75;
          filter: drop-shadow(0 0 4px rgba(45, 212, 191, 0.3));
        }

        .nifty-cell {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nifty-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(52, 211, 153, 0.2), rgba(16, 185, 129, 0.08));
          border: 1px solid rgba(52, 211, 153, 0.35);
          font-size: 0.75rem;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .outer-wrapper {
          padding: 28px;
          min-height: 100vh;
        }
      </style>
    </head>
    <body>
      <div class="outer-wrapper">
      <div class="glass-card" style="border-radius: 20px; overflow: hidden;">

        <div class="header-glass" style="padding: 28px 32px; text-align: center;">
          <div style="position: relative; z-index: 1;">
            <h1 class="title-glow" style="font-size: 1.7rem; font-weight: 800; color: rgba(94, 234, 212, 1); letter-spacing: 0.06em; text-transform: uppercase; margin: 0 0 10px;">
              Daily Upcoming Earnings &amp; Watchlist
            </h1>
            <div class="date-pill">
              <span style="font-weight: 600;">${dateStr}</span>
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: stretch; gap: 0;">

          <table>
            <thead>
              <tr>
                <th style="width: 45%;">Company Name</th>
                <th style="text-align: right; width: 35%;">Market Cap (INR CR)</th>
                ${Boolean(isEPSRequired) ? '<th style="text-align: right; width: 15%;">EPS</th>' : ""}
                <th style="text-align: center; width: 10%;">N50</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (stock, index) => `
                <tr class="${index % 2 === 0 ? "" : "row-alt"}">
                  <td class="company-name">${stock.name}</td>
                  <td style="text-align: right;">
                    <span style="display: inline-flex; align-items: center; gap: 8px; justify-content: flex-end;">
                      <span class="rupee-badge">₹</span>
                      <span class="mono-val">${stock.marketCap}</span>
                    </span>
                  </td>
                  ${
                    Boolean(isEPSRequired)
                      ? `<td style="text-align: right;">
                    <span style="display: inline-flex; align-items: center; gap: 8px; justify-content: flex-end;">
                      <span class="rupee-badge">₹</span>
                      <span class="mono-val">${stock.eps}</span>
                    </span>
                  </td>`
                      : ""
                  }
                  <td>
                    <div class="nifty-cell">
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

        <div class="footer-glass" style="display: flex; align-items: center; justify-content: center; gap: 32px;">
          <div class="footer-item">
            <img src="data:image/png;base64,${fbBase64}" style="width:18px;height:18px;" />
            <span>tsfinnews</span>
          </div>
          <div style="width: 4px; height: 4px; border-radius: 50%; background: rgba(45,212,191,0.3);"></div>
          <div class="footer-item">
            <img src="data:image/png;base64,${igBase64}" style="width:18px;height:18px;" />
            <span>@tsfinnews</span>
          </div>
          <div style="width: 4px; height: 4px; border-radius: 50%; background: rgba(45,212,191,0.3);"></div>
          <div class="footer-item">
            <img src="data:image/png;base64,${thBase64}" style="width:18px;height:18px;" />
            <span>@tsfinnews</span>
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
