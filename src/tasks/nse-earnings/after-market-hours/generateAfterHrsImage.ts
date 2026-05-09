import { TSFINNEWS_ICONS } from "../../../../lib/constants/index.js";
import { EARNINGS_POST_THEMES } from "../../../../lib/constants/theme.js";
import { uploadBufferToImgBB } from "../../../core/imgbb.js";
import { scrapperBrowser } from "../../../core/scrapper/index.js";

// 1. Pick a random theme from your EARNINGS_POST_THEMES array
const randomTheme: any =
  EARNINGS_POST_THEMES[Math.floor(Math.random() * EARNINGS_POST_THEMES.length)];

// 2. Pass this 'randomTheme' object into your HTML template function
// Ensure you handle the 'accent' if it's missing the '#'
const theme = {
  ...randomTheme,
  accent: randomTheme.accent.includes(",")
    ? `rgb(${randomTheme.accent})`
    : randomTheme.accent,
};

export const generateAfterHrsImage = async (
  results: any,
  yesterday: string,
) => {
  const { page, context, browser } = await scrapperBrowser();
  try {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-rgb: ${theme.primary};
            --secondary-rgb: ${theme.secondary};
            --accent-hex: ${theme.accent.startsWith("#") ? theme.accent : "#" + theme.accent};
            --bg-gradient: ${theme.gradient};
        }

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: #020408;
            margin: 0; padding: 0;
            display: flex; align-items: center; justify-content: center;
            height: 1080px; width: 1080px;
            color: white;
        }

        .canvas {
            width: 1000px;
            height: 1000px;
            background: radial-gradient(circle at 0% 0%, rgba(var(--primary-rgb), 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 100% 100%, rgba(var(--secondary-rgb), 0.15) 0%, transparent 50%),
                        #050810;
            border-radius: 60px;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.05);
        }

        /* Fancy Header with Glass Effect */
        .header {
            padding: 60px 50px 40px;
            position: relative;
        }

        .header-main {
            font-size: 3.5rem;
            font-weight: 800;
            line-height: 1;
            background: linear-gradient(to bottom, #fff 0%, rgba(255,255,255,0.7) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -2px;
        }

        .header-sub {
            color: var(--accent-hex);
            font-family: 'JetBrains Mono';
            font-size: 1.2rem;
            letter-spacing: 4px;
            margin-top: 10px;
            text-transform: uppercase;
        }

        .results-container {
            padding: 0 50px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        /* Glass Card Design */
        .stock-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 25px 35px;
            display: grid;
            grid-template-columns: 2.5fr 1.5fr 1.5fr 1fr;
            align-items: center;
            position: relative;
            transition: all 0.3s ease;
        }

        .stock-card::before {
            content: '';
            position: absolute;
            left: 0; top: 20%; bottom: 20%;
            width: 4px;
            border-radius: 0 4px 4px 0;
            background: var(--card-indicator);
            box-shadow: 0 0 15px var(--card-indicator);
        }

        .symbol-box .name {
            font-size: 1.8rem;
            font-weight: 800;
            color: #fff;
            display: block;
            filter: drop-shadow(0 0 10px rgba(var(--primary-rgb), 0.4));
        }

        .symbol-box .sector {
            font-size: 0.9rem;
            color: rgba(255,255,255,0.4);
            font-weight: 600;
        }

        .metric-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: rgba(255,255,255,0.3);
            margin-bottom: 5px;
        }

        .eps-value {
            font-family: 'JetBrains Mono';
            font-size: 1.4rem;
            font-weight: 700;
        }

        .profit-value {
            font-size: 1.6rem;
            font-weight: 800;
            color: #fff;
        }

        .div-value {
            font-size: 1.3rem;
            font-weight: 700;
            color: #FFD700; /* Gold for dividends */
        }

        .bullish-text { color: #00ff88; }
        .bearish-text { color: #ff4d4d; }

        /* Modern Footer */
        .footer {
            margin-top: auto;
            padding: 40px 50px;
            background: linear-gradient(to top, rgba(var(--primary-rgb), 0.1), transparent);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .social-pill {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            padding: 8px 20px;
            border-radius: 100px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 1rem;
            font-weight: 600;
        }
    </style>
</head>
<body>

    <div class="canvas">
        <div class="header">
            <div class="header-main">Earnings Update</div>
            <div class="header-sub">After Market Hours | ${yesterday}</div>
        </div>

        <div class="results-container">
            ${results
              .map((item: any) => {
                const isPositive = item.financials.eps_yoy_chg_pct >= 0;
                const statusColor = isPositive ? "#00ff88" : "#ff4d4d";

                return `
                <div class="stock-card" style="--card-indicator: ${statusColor}">
                    <div class="symbol-box">
                        <span class="name">${item.symbol}</span>
                        <span class="sector">${item.marketCap || ""}</span>
                    </div>
                    
                    <div>
                        <div class="metric-label">EPS Growth</div>
                        <div class="eps-value ${isPositive ? "bullish-text" : "bearish-text"}">
                            ${isPositive ? "▲" : "▼"} ${Math.abs(item.financials.eps_yoy_chg_pct).toFixed(1)}%
                        </div>
                    </div>

                    <div>
                        <div class="metric-label">Net Profit</div>
                        <div class="profit-value">₹${item.financials.profit_current} Cr</div>
                    </div>

                    <div style="text-align: right;">
                        <div class="metric-label">Dividend</div>
                        <div class="div-value">${item.dividend_declared ? "₹" + item.dividend_amount : "—"}</div>
                    </div>
                </div>
                `;
              })
              .join("")}
        </div>

        <div class="footer">
            <div class="flex gap-4">
                <div class="social-pill">
                    <img src="data:image/png;base64,${TSFINNEWS_ICONS.instagram}" style="width:20px;height:20px;" />
                    <span>@tsfinnews</span>
                </div>
                <div class="social-pill">
                    <img src="data:image/png;base64,${TSFINNEWS_ICONS.threads}" style="width:20px;height:20px;" />
                    <span>@tsfinnews</span>
                </div>
                <div class="social-pill">
                    <img src="data:image/png;base64,${TSFINNEWS_ICONS.facebook}" style="width:20px;height:20px;" />
                    <span>@tsfinnews</span>
                </div>
            </div>
            <div style="font-family: 'JetBrains Mono'; opacity: 0.3; font-size: 0.8rem;">
                PRECISION DATA • ${theme.name.toUpperCase()}
            </div>
        </div>
    </div>

</body>
</html>`;
    // 2. Load the HTML into the page
    await page.setContent(htmlContent);

    // 3. Take a screenshot of the specific element
    const container = await page.locator(".canvas");
    const imageBuffer = await container.screenshot({
      type: "jpeg", // Change this from default 'png'
      animations: "disabled",
      omitBackground: true, // Makes the edges clean if you want to overlay it
    });

    console.log("📸 Screenshot captured in memory. Uploading directly...");
    // 2. Upload the buffer and get the URL
    const imageUrl = await uploadBufferToImgBB(imageBuffer);

    return imageUrl;
  } catch (error) {
    console.error(
      "Error generating after market hourse image:",
      (error as Error).message,
    );
    return "";
  } finally {
    await page?.close().catch(() => {});
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
  }
};
