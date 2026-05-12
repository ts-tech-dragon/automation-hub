import fs from "node:fs";
import path from "node:path";
import { scrapperBrowser } from "../../core/scrapper/index.js";
import { uploadBufferToImgBB } from "../../core/imgbb.js";
import { NIFTY_50_STOCKS } from "../../../lib/constants/insta-earning-results/index.js";
import { EARNINGS_POST_THEMES } from "../../../lib/constants/theme.js";
import { TSFINNEWS_ICONS } from "../../../lib/constants/index.js";
import { isEpsPositive } from "../../../lib/helpers/insta-earning-results/index.js";

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
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;600;700;800&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
  <style>
    :root {
      /* Mapping your activeTheme object */
      --primary-rgb: ${activeTheme.primary};
      --secondary-rgb: ${activeTheme.secondary};
      --accent-hex: ${activeTheme.accent.startsWith("#") ? activeTheme.accent : "#" + activeTheme.accent};
      --bg-gradient: ${activeTheme.gradient};
    }

    * { box-sizing: border-box; }
    
    body {
      font-family: 'Urbanist', sans-serif;
      background: #020408;
      color: white;
      margin: 0; padding: 0;
      width: 1080px; height: 1080px;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
    }

    .dashboard-pane {
      width: 1000px; height: 1000px;
      background: #060912;
      background-image: var(--bg-gradient); /* Uses your theme's custom gradient */
      border-radius: 50px;
      border: 1px solid rgba(var(--primary-rgb), 0.3);
      display: flex; flex-direction: column;
      box-shadow: 0 0 80px rgba(var(--primary-rgb), 0.1), inset 0 0 50px rgba(0,0,0,0.4);
      position: relative;
    }

    .aurora-blur {
      position: absolute; top: -100px; right: -50px;
      width: 450px; height: 450px;
      background: rgba(var(--primary-rgb), 0.15);
      border-radius: 50%;
      filter: blur(120px);
      z-index: 0;
    }

    .header-section {
      padding: 45px 25px 35px;
      position: relative; z-index: 10;
    }

    .title-watch {
      font-size: 3.8rem; font-weight: 800; line-height: 1.1;
      letter-spacing: -2px;
      background: linear-gradient(to bottom, #fff 50%, rgba(255,255,255,0.5));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      margin-bottom: 12px;
    }

    .date-pill {
      display: inline-block;
      background: rgba(var(--primary-rgb), 0.1);
      border: 1px solid rgba(var(--primary-rgb), 0.4);
      color: var(--accent-hex);
      padding: 6px 24px; border-radius: 100px;
      font-family: 'JetBrains Mono'; font-size: 1.1rem;
      text-transform: uppercase; letter-spacing: 2px;
    }

    .data-grid {
      flex: 1; padding: 10px 10px;
      display: flex; flex-direction: column;
      justify-content: flex-start;
    }

    .header-row {
      display: grid;
      grid-template-columns: 2fr 1.3fr ${isEPSRequired ? "1.3fr" : ""} 0.5fr;
      padding: 15px 25px;
      text-transform: uppercase;
      font-size: 0.85rem; letter-spacing: 2px;
      color: rgba(255, 255, 255, 0.3);
      font-weight: 800;
      border-bottom: 1px solid rgba(var(--primary-rgb), 0.1);
    }

    .data-row {
      display: grid;
      grid-template-columns: 2fr 1.3fr ${isEPSRequired ? "1.3fr" : ""} 0.5fr;
      align-items: center;
      padding: 12px 8px;
      border-bottom: 1px solid rgba(var(--primary-rgb), 0.05);
    }

    .name-cell .name { font-size: 1.7rem; font-weight: 700; color: #fff; display: block; margin-bottom: 2px;}
    .name-cell .symbol { font-size: 0.95rem; color: var(--accent-hex); font-weight: 700; text-transform: uppercase; opacity: 0.8; }

    .value-cell { font-family: 'JetBrains Mono'; font-size: 1.5rem; font-weight: 700; color: #f1f5f9; }
    
    .nifty-cell {
      width: 45px; height: 45px;
      background: rgba(var(--primary-rgb), 0.05);
      border: 1px solid rgba(var(--primary-rgb), 0.2);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem;
    }

    .footer-area {
      padding: 40px 65px;
      display: flex; justify-content: space-between; align-items: center;
      background: linear-gradient(to top, rgba(var(--primary-rgb), 0.05), transparent);
      border-radius: 0 0 50px 50px;
    }

    .brand-handle {
      display: flex; align-items: center; gap: 10px;
      font-weight: 700; color: rgba(255, 255, 255, 0.85);
    }
  </style>
</head>
<body>
  <div class="dashboard-pane">
    <div class="aurora-blur"></div>
    
    <div class="header-section">
      <h1 class="title-watch">
        ${isEPSRequired ? "Earnings Results Declared" : "Upcoming Earnings Results"}
      </h1>
      <div class="date-pill">${dateStr}</div>
    </div>

    <div class="data-grid">
      <div class="header-row">
        <span>Company</span>
        <span style="text-align: right;">M.Cap (Cr)</span>
        ${isEPSRequired ? '<span style="text-align: right;">EPS</span>' : ""}
        <span style="text-align: center;">N50</span>
      </div>

      ${data
        .map(
          (stock) => `
      <div class="data-row">
        <div class="name-cell">
          <span class="name">${stock.name}</span>
        </div>
        
        <div class="value-cell" style="text-align: right;">${stock.marketCap}</div>

        ${
          isEPSRequired
            ? `
            <div class="value-cell" style="text-align: right; display: flex; align-items: center; justify-content: flex-end; gap: 8px;">
              <span style="color: ${isEpsPositive(stock.eps) ? "#22c55e" : "#ef4444"}; font-size: 1.2rem;">
                ${isEpsPositive(stock.eps) ? "▲" : "▼"}
              </span>
              <span style="color: var(--accent-hex)">${stock.eps}</span>
            </div>`
            : ""
        }

        <div class="flex justify-center">
          <div class="nifty-cell">
            ${stock.isNifty ? "💎" : "•"}
          </div>
        </div>
      </div>
      `,
        )
        .join("")}
    </div>

    <div class="footer-area">
      <div class="brand-handle">
        <img src="data:image/png;base64,${TSFINNEWS_ICONS.facebook}" style="width:20px;height:20px; opacity: 0.5;" />
        <span>@tsfinnews</span>
      </div>
      <div class="brand-handle">
        <img src="data:image/png;base64,${TSFINNEWS_ICONS.instagram}" style="width:20px;height:20px; opacity: 0.5;" />
        <span>@tsfinnews</span>
      </div>
      <div class="brand-handle">
        <img src="data:image/png;base64,${TSFINNEWS_ICONS.threads}" style="width:20px;height:20px; opacity: 0.5;" />
        <span>@tsfinnews</span>
      </div>
      <div style="font-family: 'JetBrains Mono'; font-size: 0.8rem; color: rgba(var(--primary-rgb), 0.4); letter-spacing: 3px; font-weight: 700;">
        THEME: ${activeTheme.name.toUpperCase()}
      </div>
    </div>
  </div>
</body>
</html>`;

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
