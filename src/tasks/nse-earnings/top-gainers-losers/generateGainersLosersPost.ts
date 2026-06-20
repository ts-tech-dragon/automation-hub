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
  change: Number;
}

export async function generateWeeklyMoversImage(
  topGainers: MoverStock[],
  topLosers: MoverStock[],
) {
  const { page, context, browser } = await scrapperBrowser();

  try {
    const dynamicDate =
      getFormattedDateInIST("DD-MMM", 5) +
      " - " +
      getFormattedDateInIST("DD-MMM", 1);

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700;900&family=JetBrains+Mono:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      background-color: #ffffff;
      background-image: 
        linear-gradient(rgba(0, 0, 0, 0.015) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 0, 0, 0.015) 1px, transparent 1px);
      background-size: 40px 40px;
      font-family: 'Outfit', sans-serif;
      width: 1080px; height: 1080px;
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 60px 65px;
      color: #0b1530;
      position: relative; overflow: hidden;
    }

    .header {
      width: 100%; display: flex; justify-content: space-between; align-items: flex-end;
      position: relative; z-index: 10;
      border-bottom: 2px solid #f1f5f9; padding-bottom: 25px;
    }
    .header .title-main {
      font-size: 44px; font-weight: 900; color: #0b1530; letter-spacing: -0.5px; text-transform: uppercase;
    }
    .header .title-sub {
      font-size: 16px; font-weight: 500; color: #64748b; margin-top: 4px;
    }
    .header .week-badge {
      background: #f8fafc; border: 1px solid #e2e8f0;
      padding: 10px 20px; border-radius: 0px; font-family: 'JetBrains Mono'; font-size: 14px; color: #334155; font-weight: 700;
    }

    .main-content {
      display: flex; gap: 45px; width: 100%; flex: 1; margin: 40px 0; position: relative; z-index: 10;
    }

    .column { flex: 1; display: flex; flex-direction: column; gap: 14px; }

    .column-title {
      font-size: 24px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase;
      padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center;
    }
    
    /* Strict color accents taken from the reference slide banners */
    .title-gainer { color: #008f9d; border-bottom: 4px solid #008f9d; } 
    .title-loser { color: #d62c2c; border-bottom: 4px solid #d62c2c; }  
    
    .column-subtitle { font-family: 'JetBrains Mono'; font-size: 12px; color: #94a3b8; font-weight: 700; }

    /* Cards transformed into high-impact solid colored blocks with completely sharp edges */
    .card {
      display: flex; align-items: center; justify-content: space-between;
      height: 112px; padding: 0 24px; 
      border-radius: 0px; /* Sharp edgened corners */
      position: relative;
      border: none;
    }

    /* Solid color fills to match the "BUY" and "SELL" reference banners */
    .card-gainer-accent { 
      background-color: #008f9d;
    }
    .card-loser-accent { 
      background-color: #d62c2c;
    }

    .card-left { display: flex; align-items: center; gap: 18px; max-width: 65%; }
    
    .avatar-box {
      width: 46px; height: 46px; border-radius: 0px; display: flex; align-items: center; justify-content: center;
      font-family: 'JetBrains Mono'; font-size: 14px; font-weight: 800;
    }
    /* Translucent treatments keep structural balance on the solid dark colors */
    .avatar-gainer { background: rgba(255, 255, 255, 0.15); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.2); }
    .avatar-loser { background: rgba(255, 255, 255, 0.15); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.2); }

    .meta-details { display: flex; flex-direction: column; gap: 2px; }
    
    /* White text styling explicitly integrated for extreme contrast */
    .symbol { font-family: 'JetBrains Mono'; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
    .company-name { font-size: 14px; font-weight: 500; color: rgba(255, 255, 255, 0.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px; }

    .card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
    
    .metrics-pct { 
      font-family: 'JetBrains Mono'; font-size: 26px; font-weight: 800; 
      color: #ffffff; display: flex; align-items: center; gap: 6px;
    }

    .trend-icon { font-size: 16px; color: rgba(255, 255, 255, 0.9); }
    .metrics-price { font-family: 'JetBrains Mono'; font-size: 15px; font-weight: 600; color: rgba(255, 255, 255, 0.85); }

    .footer {
      width: 100%; display: flex; justify-content: space-between; align-items: center;
      position: relative; z-index: 10;
      border-top: 2px solid #f1f5f9; padding-top: 25px;
    }
    .social-block { display: flex; align-items: center; gap: 12px; font-size: 16px; font-weight: 700; color: #475569; }
    .social-icons { display: flex; gap: 10px; }
    .social-icons img { width: 20px; height: 20px; filter: invert(0.2); opacity: 0.8; }
    .disclaimer { font-family: 'JetBrains Mono'; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
  </style>
</head>
<body>

  <!-- HEADER COMPONENT -->
  <div class="header">
    <div>
      <div class="title-main">Weekly Market Wrap</div>
      <div class="title-sub">NSE Top Performers & Market Trajectory</div>
    </div>
    <div class="week-badge" style={{font-size:1rem}}>WEEK ENDING: ${dynamicDate}</div>
  </div>

  <!-- LEADERBOARD DATA LAYOUT -->
  <div class="main-content">
    
    <!-- LEFT SIDE: BUY / TOP GAINERS -->
    <div class="column">
      <div class="column-title title-gainer">
        <span>🚀 Bull Market • Gainers</span>
        <span class="column-subtitle">5D CHANGE</span>
      </div>
      ${topGainers
        .map(
          (stock) => `
        <div class="card card-gainer-accent">
          <div class="card-left">
            <div class="avatar-box avatar-gainer">${stock.cleanSymbol.slice(0, 2)}</div>
            <div class="meta-details">
              <span class="symbol">${stock.cleanSymbol}</span>
              <span class="company-name">${stock.cleanName}</span>
            </div>
          </div>
          <div class="card-right">
            <div class="metrics-pct">
              <span>+${stock.change.toFixed(2)}%</span>
              <span class="trend-icon">↗</span>
            </div>
            <div class="metrics-price">₹${Number(stock.currentPrice).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>

    <!-- RIGHT SIDE: SELL / TOP LOSERS -->
    <div class="column">
      <div class="column-title title-loser">
        <span>🩸 Bear Market • Losers</span>
        <span class="column-subtitle">5D CHANGE</span>
      </div>
      ${topLosers
        .map(
          (stock) => `
        <div class="card card-loser-accent">
          <div class="card-left">
            <div class="avatar-box avatar-loser">${stock.cleanSymbol.slice(0, 2)}</div>
            <div class="meta-details">
              <span class="symbol">${stock.cleanSymbol}</span>
              <span class="company-name">${stock.cleanName}</span>
            </div>
          </div>
          <div class="card-right">
            <div class="metrics-pct">
              <span>${stock.change.toFixed(2)}%</span>
              <span class="trend-icon">↘</span>
            </div>
            <div class="metrics-price">₹${Number(stock.currentPrice).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>
      `,
        )
        .join("")}
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

    console.log("📸 High-impact solid presentation layout captured.");
    const imageUrl = await uploadBufferToImgBB(imageBuffer);
    console.log(`🔗 Production Image Ready: ${imageUrl}`);

    return imageUrl;
  } catch (error) {
    console.error(
      "generateWeeklyMoversImage processing error: ",
      (error as Error).message,
    );
    return "";
  } finally {
    await page?.close().catch(() => {});
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
  }
}
