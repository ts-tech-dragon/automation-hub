import { TSFINNEWS_ICONS } from "../../../../lib/constants/index.js";
import { EARNINGS_POST_THEMES } from "../../../../lib/constants/theme.js";
import { uploadBufferToImgBB } from "../../../core/imgbb.js";
import { scrapperBrowser } from "../../../core/scrapper/index.js";

// Randomly pick a theme (Keep this outside or inside the function depending on your workflow)
const activeTheme: any =
  EARNINGS_POST_THEMES[Math.floor(Math.random() * EARNINGS_POST_THEMES.length)];

export async function generateTop10DividendImage(
  data: {
    dividend: number;
    symbol: string;
    name: string;
    exDate: string;
  }[],
) {
  const { page, context, browser } = await scrapperBrowser();

  try {
    // 1. Ensure we only take the top 10 and sort them by dividend (highest to lowest)
    const top10Data = data.sort((a, b) => b.dividend - a.dividend).slice(0, 10);

    // 2. Find the maximum dividend to scale the bars correctly
    const maxDividend = Math.max(...top10Data.map((d) => d.dividend));

    // 3. Current Date for the subtitle
    const dateStr = (top10Data[0] as any).exDate;

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;700;900&family=JetBrains+Mono:wght@700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      /* Deep Obsidian / Teal Dark Mode Background */
      background: radial-gradient(120% 120% at 50% 0%, #0f172a 0%, #020617 100%);
      font-family: 'Outfit', sans-serif;
      width: 1080px; height: 1080px;
      display: flex; flex-direction: column; align-items: center; justify-content: space-between;
      padding: 50px 60px;
      position: relative; overflow: hidden;
      color: white;
    }

    /* Ambient Glow in the background */
    .glow-sphere {
      position: absolute; top: -150px; left: 50%; transform: translateX(-50%);
      width: 800px; height: 400px;
      background: #0ea5e9;
      filter: blur(200px); opacity: 0.15; z-index: 0;
    }

    .header {
      width: 100%; text-align: center; position: relative; z-index: 10;
      margin-bottom: 20px;
    }
    
    .header h2 {
      color: #38bdf8; font-family: 'JetBrains Mono'; font-size: 20px; 
      letter-spacing: 6px; text-transform: uppercase; margin-bottom: 8px;
    }
    
    .header h1 {
      font-size: 65px; font-weight: 900; letter-spacing: -1px; line-height: 1.1;
      text-transform: uppercase;
    }

    .header h1 span { color: #facc15; } /* Highlight word in yellow */

    .leaderboard-container {
      width: 100%; display: flex; flex-direction: column; gap: 12px;
      position: relative; z-index: 10; flex: 1; justify-content: center;
    }

    .row {
      position: relative;
      display: flex; align-items: center; justify-content: space-between;
      height: 64px; /* Perfectly sized to fit 10 items */
      padding: 0 25px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      overflow: hidden;
    }

    /* THE DYNAMIC BAR CHART BACKGROUND */
    .progress-fill {
      position: absolute; left: 0; top: 0; height: 100%;
      /* Sleek Cyan to Blue gradient for the bar */
      background: linear-gradient(90deg, rgba(14, 165, 233, 0.2) 0%, rgba(56, 189, 248, 0.4) 100%);
      border-right: 2px solid #38bdf8;
      z-index: 1;
      border-radius: 12px 0 0 12px;
      /* Animation disabled for Playwright, but sets up the width */
      transition: width 0.5s ease-out;
    }

    .row-content {
      position: relative; z-index: 2;
      display: flex; align-items: center; width: 100%;
    }

    .rank {
      width: 45px; font-family: 'JetBrains Mono'; font-size: 24px; font-weight: 800;
      color: rgba(255, 255, 255, 0.4);
    }

    /* Make top 3 ranks pop */
    .row[data-rank="1"] .rank { color: #fbbf24; text-shadow: 0 0 10px rgba(251, 191, 36, 0.5); }
    .row[data-rank="2"] .rank { color: #94a3b8; }
    .row[data-rank="3"] .rank { color: #b45309; }

    .company-info { display: flex; align-items: baseline; gap: 15px; flex: 1; }
    
    .symbol {
      background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 6px;
      font-family: 'JetBrains Mono'; font-size: 14px; font-weight: 700; color: #bae6fd;
    }
    
    .name {
      font-size: 22px; font-weight: 600; white-space: nowrap; 
      overflow: hidden; text-overflow: ellipsis; max-width: 450px;
    }

    .dividend-value {
      font-family: 'JetBrains Mono'; font-size: 28px; font-weight: 800;
      display: flex; align-items: center; gap: 6px;
    }
    .currency { font-size: 20px; color: #38bdf8; opacity: 0.8; }

    .footer {
      width: 100%; display: flex; justify-content: space-between; align-items: center;
      position: relative; z-index: 10;
      padding-top: 25px; border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .social-tag {
      display: flex; align-items: center; gap: 10px;
      font-weight: 700; color: rgba(255, 255, 255, 0.7); font-size: 18px;
    }
  </style>
</head>
<body>
  
  <div class="glow-sphere"></div>

  <div class="header">
  <h1>GROW YOUR <span>DIVIDEND</span> SNOWBALL</h1>
    <h2>Dividend Alert ⏰ • EX-DATE ${dateStr}</h2>
  </div>

  <div class="leaderboard-container">
    ${top10Data
      .map((stock, index) => {
        // Calculate percentage width relative to the highest dividend
        const fillPercentage = (stock.dividend / maxDividend) * 100;
        const rank = index + 1;

        return `
      <div class="row" data-rank="${rank}">
        <div class="progress-fill" style="width: ${fillPercentage}%;"></div>
        
        <div class="row-content">
          <div class="rank">#${rank}</div>
          <div class="company-info">
            <div class="symbol">${stock.symbol}</div>
            <div class="name">${stock.name.replace(" Limited", "").replace(" Ltd", "")}</div>
          </div>
          <div class="dividend-value">
            <span class="currency">₹</span>${Number(stock.dividend).toFixed(2)}
          </div>
        </div>
      </div>
      `;
      })
      .join("")}
  </div>

  <div class="footer">
    <div style="display: flex; gap: 20px;">
      <div class="social-tag">
        <img src="data:image/png;base64,${TSFINNEWS_ICONS.instagram}" style="width:24px;height:24px; opacity: 0.8;" />
        </div>
        <div class="social-tag">
        <img src="data:image/png;base64,${TSFINNEWS_ICONS.threads}" style="width:24px;height:24px; opacity: 0.8;" />
        </div>
        <div class="social-tag">
        <img src="data:image/png;base64,${TSFINNEWS_ICONS.facebook}" style="width:24px;height:24px; opacity: 0.8;" />
        </div>
        <div class="social-tag">
        <img src="data:image/png;base64,${TSFINNEWS_ICONS.x}" style="width:24px;height:24px; opacity: 0.8;" />
        </div>
        @tsfinnews
    </div>
    <div style="font-family: 'JetBrains Mono'; font-size: 14px; color: rgba(255,255,255,0.4); letter-spacing: 2px;">
      DATA SORTED BY DIVIDEND VALUE
    </div>
  </div>

</body>
</html>`;

    await page.setContent(htmlContent);
    const container = await page.locator("body");
    const imageBuffer = await container.screenshot({
      type: "jpeg",
      animations: "disabled",
      quality: 100,
    });

    console.log("📸 Screenshot captured in memory. Uploading directly...");
    const imageUrl = await uploadBufferToImgBB(imageBuffer);
    console.log(`🔗 Success! Image URL: ${imageUrl}`);

    return imageUrl;
  } catch (error) {
    console.log(
      "generateTop10DividendImage error : ",
      (error as Error).message,
    );
    return "";
  } finally {
    await page?.close().catch(() => {});
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
  }
}
