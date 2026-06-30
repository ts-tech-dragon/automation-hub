import { TSFINNEWS_ICONS } from "../../../../lib/constants/index.js";
import { getFormattedUpcomingDateInIST } from "../../../../lib/helpers/day.js";
import { uploadBufferToImgBB } from "../../../core/imgbb.js";
import { scrapperBrowser } from "../../../core/scrapper/index.js";

interface ForthcomingListing {
  companyName: string;
  effectiveDate: string;
  financialResults: string | null;
  isin: string;
  remark: string | null;
  series: string;
  shdAttachment: string;
  specialPreOpen: "Y" | "N";
  symbol: string;
}

export async function generateIpoListingsImage(listings: ForthcomingListing[]) {
  const { page, context, browser } = await scrapperBrowser();

  try {
    const prominentListingDate =
      listings[0]?.effectiveDate ||
      getFormattedUpcomingDateInIST("DD-MMM-YY", 1);

    // Deep, punchy color blocks designed to stand out sharply against the dark row containers
    const accentPalettes = [
      { primary: "#2563eb", badge: "#1d4ed8" }, // Electric Blue
      { primary: "#059669", badge: "#047857" }, // Emerald Green
      { primary: "#ea580c", badge: "#c2410c" }, // Intense Orange
      { primary: "#7c3aed", badge: "#6d28d9" }, // Royal Purple
      { primary: "#db2777", badge: "#be185d" }, // Hot Pink
    ];

    // Handle data rendering or elegant fallback state
    const gridContent =
      listings && listings.length > 0
        ? listings
            .slice(0, 5)
            .map((row, index) => {
              const palette = accentPalettes[
                (index % accentPalettes.length) as keyof typeof accentPalettes
              ] as any;
              const formattedIndex = String(index + 1).padStart(2, "0");

              return `
            <div class="grid-row">
              <div class="row-index-badge" style="background-color: ${palette.badge};">
                ${formattedIndex}
              </div>
              
              <div class="cell-company">
                ${row.companyName}
              </div>
              
              <div class="cell-meta">
                <span class="meta-label">Series</span>
                <span class="meta-value mono">${row.series}</span>
              </div>
              
              <div class="cell-meta">
                <span class="meta-label">Pre-Open</span>
                <span class="meta-value" style="color: ${row.specialPreOpen === "Y" ? "#00f5d4" : "#94a3b8"};">
                  ${row.specialPreOpen === "Y" ? "YES" : "NO"}
                </span>
              </div>
              
              <div class="cell-highlight-symbol" style="background-color: ${palette.primary};">
                <span class="symbol-txt">${row.symbol}</span>
                <span class="symbol-sub">Ticker</span>
              </div>
            </div>
          `;
            })
            .join("")
        : `
        <div class="no-data-card">
          <div class="no-data-title">No New Listings Scheduled</div>
          <div class="no-data-sub">There are no fresh market debuts or terminal activations slated for this trading session.</div>
        </div>
      `;

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700;800;900&family=JetBrains+Mono:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      background-color: #ffffff;
      background-image: 
        linear-gradient(rgba(0, 0, 0, 0.015) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 0, 0, 0.015) 1px, transparent 1px);
      background-size: 30px 30px;
      font-family: 'Outfit', sans-serif;
      width: 1080px; height: 1080px;
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 45px 50px; /* Reduced layout padding from 65px/75px to maximize usable area */
      color: #0b1530;
      position: relative; overflow: hidden;
    }

    .header {
      width: 100%; display: flex; justify-content: space-between; align-items: flex-start;
      position: relative; z-index: 10; padding-bottom: 15px;
    }
    .header .title-left { max-width: 60%; }
    .header .title-main {
      font-size: 48px; font-weight: 900; color: #0d1e42; letter-spacing: -1px; text-transform: uppercase; line-height: 1.1;
    }
    .header .title-sub {
      font-size: 18px; font-weight: 500; color: #8a99ad; margin-top: 4px;
    }
    
    /* Prominent Listing Date Section */
    .header .date-right { text-align: right; }
    .header .massive-date {
      font-size: 62px; font-weight: 900; color: #0d1e42; letter-spacing: -1px; line-height: 1;
    }
    .header .date-label {
      font-family: 'JetBrains Mono'; font-size: 14px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;
    }

    .main-content {
      width: 100%;
      flex: 1; 
    margin: 20px 0; 
    display: flex; 
    flex-direction: column; 
    justify-content: center; 
    position: relative; 
    z-index: 10;
    height: 780px; /* Locks the middle arena size so footer never moves */
    }

    .modern-grid {
      width: 100%; 
    height: 100%; /* Spans the full height of the main content arena */
    display: flex; 
    flex-direction: column; 
    gap: 12px;
    }

    /* Dark-themed row container expanded to 130px height for larger text visibility */
    .grid-row {
      display: flex; 
    width: 100%; 
    flex: 1; /* Automatically distributes space equally among rows */
    min-height: 75px; /* Prevents text squeezing on extreme days */
    background: #0f172a;
    box-shadow: 0 15px 20px -5px rgba(15, 23, 42, 0.25);
    }

    /* Index Ribbon Label block */
    .row-index-badge {
      width: 80px; height: 100%; display: flex; align-items: center; justify-content: center;
      font-family: 'JetBrains Mono'; font-size: 24px; font-weight: 800; color: #ffffff;
    }

    /* Boosted typography metrics inside row cells */
    .cell-company {
      flex: 2.4; display: flex; align-items: center; padding: 10px 35px;
    font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.2;
    }

    .cell-meta {
      flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center;
      background: #1e293b; border-right: 1px solid #334155; padding: 0 10px;
    }
    .meta-label {
      font-family: 'JetBrains Mono'; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;
    }
    .meta-value {
      font-size: 22px; font-weight: 800; color: #ffffff; text-align: center;
    }
    .meta-value.mono { font-family: 'JetBrains Mono'; font-size: 20px; }

    /* Right Margin Ticker Accent Block */
    .cell-highlight-symbol {
      flex: 1.5; display: flex; flex-direction: column; justify-content: center; align-items: center;
      color: #ffffff; padding: 0 15px;
    }
    .symbol-txt { font-family: 'JetBrains Mono'; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; text-align: center; }
    .symbol-sub { font-size: 12px; font-weight: 500; color: rgba(255, 255, 255, 0.7); text-transform: uppercase; margin-top: 4px; }

    /* Empty State Fallback */
    .no-data-card {
      width: 100%; padding: 80px 40px; background: #0f172a; text-align: center;
      box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.25);
      border-left: 6px solid #64748b;
    }
    .no-data-title {
      font-size: 32px; font-weight: 800; color: #ffffff; margin-bottom: 12px;
    }
    .no-data-sub {
      font-size: 18px; color: #94a3b8; max-width: 650px; margin: 0 auto; line-height: 1.5;
    }

    .footer {
      width: 100%; display: flex; justify-content: space-between; align-items: center;
      position: relative; z-index: 10; border-top: 2px solid #f1f5f9; padding-top: 20px;
    }
    .social-block { display: flex; align-items: center; gap: 12px; font-size: 18px; font-weight: 700; color: #475569; }
    .social-icons { display: flex; gap: 10px; }
    .social-icons img { width: 22px; height: 22px; filter: invert(0.2); opacity: 0.8; }
    .disclaimer { font-family: 'JetBrains Mono'; font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
  </style>
</head>
<body>

  <div class="header">
    <div class="title-left">
      <div class="title-main">IPO Listing Today</div>
      <div class="title-sub">Fresh Market Debuts & Trading Terminals</div>
    </div>
    <div class="date-right">
      <div class="massive-date">${prominentListingDate}</div>
      <div class="date-label">Listing Date</div>
    </div>
  </div>

  <div class="main-content">
    <div class="modern-grid">
      ${gridContent}
    </div>
  </div>

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
      Verified NSE Forthcoming Equity Stream Feed
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

    console.log("📸 High-impact terminal layout captured successfully.");
    const imageUrl = await uploadBufferToImgBB(imageBuffer);
    console.log(`🔗 Production Image Ready: ${imageUrl}`);

    return imageUrl;
  } catch (error) {
    console.error(
      "generateModernListingsImage processing error: ",
      (error as Error).message,
    );
    return "";
  } finally {
    await page?.close().catch(() => {});
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
  }
}
