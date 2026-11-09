import { TSFINNEWS_ICONS } from "../../../../lib/constants/index.js";
import { getFormattedDateInIST } from "../../../../lib/helpers/day.js";
import { uploadBufferToImgBB } from "../../../core/imgbb.js";
import { scrapperBrowser } from "../../../core/scrapper/index.js";

interface MoverStock {
  "sr.": number;
  stockName: string;
  symbol: string;
  currentPrice: number | string;
  priceBeforeOneWeek: number | string;
  Change?: number;
  cleanName: string;
  cleanSymbol: string;
  change: number;
}

export async function generateUpTrendImage(topGainers: MoverStock[]) {
  const { page, context, browser } = await scrapperBrowser();

  try {
    // Today's Date in IST
    const todayDate = getFormattedDateInIST("DD MMM YYYY", 0);

    // Split the 10 gainers into two columns of 5
    const leftColumnGainers = topGainers.slice(0, 5);
    const rightColumnGainers = topGainers.slice(5, 10);

    const renderCard = (stock: MoverStock, rank: number) => `
      <div class="card">
        <div class="card-left">
          <div class="rank-badge">#${String(rank).padStart(2, "0")}</div>
          <div class="meta-details">
            <span class="symbol">${stock.cleanSymbol}</span>
            <span class="company-name">${stock.cleanName}</span>
          </div>
        </div>
        <div class="card-right">
          <div class="metrics-pct">
            <span>+${Number(stock.change).toFixed(2)}%</span>
            <span class="trend-icon">↗</span>
          </div>
          <div class="metrics-price">₹${Number(stock.currentPrice).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>
    `;

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      /* Exact dark charcoal/slate tone from reference image */
      background-color: #202426;
      background-image: 
        radial-gradient(circle at 50% 50%, rgba(46, 213, 115, 0.04) 0%, transparent 70%);
      font-family: 'Outfit', sans-serif;
      width: 1080px; height: 1080px;
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 58px 65px;
      color: #ffffff;
      position: relative; overflow: hidden;
    }

    /* Subtle architectural connector lines inspired by the reference diagram */
    .header {
      width: 100%; display: flex; justify-content: space-between; align-items: flex-end;
      position: relative; z-index: 10;
      border-bottom: 1.5px solid rgba(255, 255, 255, 0.14);
      padding-bottom: 24px;
    }
    .header .title-main {
      font-size: 42px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;
    }
    .header .title-sub {
      font-size: 16px; font-weight: 400; color: rgba(255, 255, 255, 0.65); margin-top: 6px;
    }
    .header .date-badge {
      background: rgba(46, 213, 115, 0.08);
      border: 1.5px solid #2ed573;
      padding: 10px 22px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 15px;
      color: #ffffff;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .section-header {
      width: 100%;
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 24px;
      padding-bottom: 12px;
      border-bottom: 1.5px solid #2ed573;
    }
    .section-title {
      font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase;
      display: flex; align-items: center; gap: 10px;
    }
    .green-dot {
      width: 10px; height: 10px; background-color: #2ed573; display: inline-block;
    }
    .section-subtitle {
      font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(255, 255, 255, 0.7); font-weight: 600;
    }

    .main-content {
      display: flex; gap: 40px; width: 100%; flex: 1; margin: 26px 0 32px 0; position: relative; z-index: 10;
    }

    .column {
      flex: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 16px;
    }

    /* Green box covering the stock name and percentage */
    .card {
      display: flex; align-items: center; justify-content: space-between;
      height: 110px; padding: 0 24px;
      background-color: rgba(46, 213, 115, 0.10);
      border: 2px solid #2ed573;
      border-radius: 0px;
      position: relative;
    }

    .card-left {
      display: flex; align-items: center; gap: 16px; max-width: 63%;
    }
    
    .rank-badge {
      width: 44px; height: 44px;
      display: flex; align-items: center; justify-content: center;
      font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 800;
      color: #ffffff;
      background: rgba(46, 213, 115, 0.18);
      border: 1.5px solid #2ed573;
      flex-shrink: 0;
    }

    .meta-details {
      display: flex; flex-direction: column; gap: 3px; overflow: hidden;
    }
    
    /* Pure white text for symbol, company name, and percentage */
    .symbol {
      font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 800;
      color: #ffffff; letter-spacing: -0.3px;
    }
    .company-name {
      font-size: 14px; font-weight: 400; color: #ffffff;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 215px;
    }

    .card-right {
      display: flex; flex-direction: column; align-items: flex-end; gap: 3px;
    }
    
    .metrics-pct { 
      font-family: 'JetBrains Mono', monospace; font-size: 25px; font-weight: 800; 
      color: #ffffff; display: flex; align-items: center; gap: 5px;
    }

    .trend-icon {
      font-size: 18px; color: #ffffff; font-weight: 800;
    }
    .metrics-price {
      font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 500;
      color: #ffffff;
    }

    .footer {
      width: 100%; display: flex; justify-content: space-between; align-items: center;
      position: relative; z-index: 10;
      border-top: 1.5px solid rgba(255, 255, 255, 0.14); padding-top: 24px;
    }
    .social-block {
      display: flex; align-items: center; gap: 12px; font-size: 16px; font-weight: 600; color: #ffffff;
    }
    .social-icons { display: flex; gap: 10px; }
    .social-icons img { width: 20px; height: 20px; filter: brightness(0) invert(1); opacity: 0.9; }
    .disclaimer {
      font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(255, 255, 255, 0.65);
      text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;
    }
  </style>
</head>
<body>

  <!-- HEADER COMPONENT -->
  <div class="header">
    <div>
      <div class="title-main">Top Market Gainers</div>
      <div class="title-sub">NSE Bullish Outperformers & Momentum Leaders</div>
    </div>
    <div class="date-badge">${todayDate}</div>
  </div>

  <!-- SUBHEADER BAR -->
  <div class="section-header">
    <div class="section-title">
      <span class="green-dot"></span>
      <span>Top 10 Gainers Leaderboard</span>
    </div>
    <div class="section-subtitle">RANKS #01 – #10</div>
  </div>

  <!-- 2-COLUMN 10-STOCK GRID -->
  <div class="main-content">
    
    <!-- LEFT COLUMN: RANKS 1 TO 5 -->
    <div class="column">
      ${leftColumnGainers.map((stock, idx) => renderCard(stock, idx + 1)).join("")}
    </div>

    <!-- RIGHT COLUMN: RANKS 6 TO 10 -->
    <div class="column">
      ${rightColumnGainers.map((stock, idx) => renderCard(stock, idx + 6)).join("")}
    </div>

  </div>

  <!-- FOOTER COMPONENT -->
  <div class="footer">
    <div class="social-block">
      <div class="social-icons">
        <img src="data:image/png;base64,${TSFINNEWS_ICONS.instagram}" />
        <img src="data:image/png;base64,${TSFINNEWS_ICONS.threads}" />
        <img src="data:image/png;base64,${TSFINNEWS_ICONS.facebook}" />
        <img src="data:image/png;base64,${TSFINNEWS_ICONS.x}" />
      </div>
      @tsfinnews
    </div>
    <div class="disclaimer">
      Data Sorted by % Change | Minimum Market Cap: ₹10,000 CR
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

    console.log("📸 Dark Charcoal & Green Box Top 10 Gainers layout captured.");
    const imageUrl = await uploadBufferToImgBB(imageBuffer);
    console.log(`🔗 Production Image Ready: ${imageUrl}`);

    return imageUrl;
  } catch (error) {
    console.error(
      "generateTopGainersImage processing error: ",
      (error as Error).message,
    );
    return "";
  } finally {
    await page?.close().catch(() => {});
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
  }
}
