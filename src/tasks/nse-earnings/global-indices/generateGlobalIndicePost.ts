import { TSFINNEWS_ICONS } from "../../../../lib/constants/index.js";
import { EARNINGS_POST_THEMES } from "../../../../lib/constants/theme.js";
import { getFormattedDateInIST } from "../../../../lib/helpers/day.js";
import { uploadBufferToImgBB } from "../../../core/imgbb.js";
import { scrapperBrowser } from "../../../core/scrapper/index.js";

interface IndiceData {
  sNo: number;
  indice: string;
  country: string;
  currentValue: number;
  previousDay: number;
  ForPreviousDay: number;
}

interface CountryMarketData {
  country: string;
  flag: string;
  indices: IndiceData[];
}

export async function generateGlobalIndiceImage(marketData: CountryMarketData) {
  const { page, context, browser } = await scrapperBrowser();

  try {
    const theme: any =
      EARNINGS_POST_THEMES[
        Math.floor(Math.random() * EARNINGS_POST_THEMES.length)
      ];
    const formatNum = (num: number) =>
      num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const marketDate = getFormattedDateInIST("DD-MMM-YYYY");
    const isMulti = marketData.indices.length > 1;

    // Map through indices
    const indicesHtml = marketData.indices
      .map((data, index) => {
        const changePercent = data.ForPreviousDay * 100;
        const isPositive = changePercent >= 0;
        const trendColor = isPositive ? "#22c55e" : "#ef4444";
        const trendBg = isPositive
          ? "rgba(34, 197, 94, 0.1)"
          : "rgba(239, 68, 68, 0.1)";
        const trendIcon = isPositive
          ? `<svg width="${isMulti ? "28" : "40"}" height="${isMulti ? "28" : "40"}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>`
          : `<svg width="${isMulti ? "28" : "40"}" height="${isMulti ? "28" : "40"}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>`;

        const divider = index !== 0 ? `<div class="divider"></div>` : "";

        if (isMulti) {
          return `
          ${divider}
          <div class="indice-row">
            <div class="indice-info">
              <div class="indice-title-multi text-gradient">${data.indice}</div>
              <div class="metric-label">Previous Close: ${formatNum(data.previousDay)}</div>
            </div>
            <div class="metrics-container">
              <div class="metric-value-multi">${formatNum(data.currentValue)}</div>
              <div class="trend-badge trend-badge-multi" style="background: ${trendBg}; border-color: ${trendColor}; color: ${trendColor};">
                ${trendIcon}
                <div class="trend-value-multi">${isPositive ? "+" : ""}${changePercent.toFixed(2)}%</div>
              </div>
            </div>
          </div>
        `;
        } else {
          return `
          <div class="indice-title-single text-gradient">${data.indice}</div>
          <div class="divider"></div>
          <div class="metrics-grid">
            <div class="metric-block">
              <div class="metric-label">Current Value</div>
              <div class="metric-value-single">${formatNum(data.currentValue)}</div>
            </div>
            <div class="metric-block">
              <div class="metric-label">Previous Close</div>
              <div class="metric-value-secondary">${formatNum(data.previousDay)}</div>
            </div>
          </div>
          <div>
            <div class="trend-badge trend-badge-single" style="background: ${trendBg}; border-color: ${trendColor}; color: ${trendColor};">
              ${trendIcon}
              <div class="trend-value-single">${isPositive ? "+" : ""}${changePercent.toFixed(2)}%</div>
            </div>
          </div>
        `;
        }
      })
      .join("");

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&family=JetBrains+Mono:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-color: #0f172a; width: 1080px; height: 1080px; display: flex; flex-direction: column; justify-content: space-between; padding: 60px 65px; color: #ffffff; font-family: 'Outfit', sans-serif; position: relative; overflow: hidden; }
    .background-gradient { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: ${theme.gradient}; z-index: 0; }
    .glow-orb { position: absolute; top: -10%; right: -10%; width: 700px; height: 700px; background: radial-gradient(circle, rgba(${theme.primary}, 0.25) 0%, rgba(0,0,0,0) 70%); border-radius: 50%; z-index: 0; filter: blur(60px); }
    .top-right-badge { position: absolute; top: 60px; right: 65px; z-index: 20; text-align: right; }
    .badge-title { font-size: 24px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
    .badge-date { font-family: 'JetBrains Mono'; font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 4px; }
    .main-content { position: relative; z-index: 10; display: flex; flex-direction: column; justify-content: center; align-items: center; flex: 1; width: 100%; }
    .glass-card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(24px); border: 1px solid rgba(${theme.primary}, 0.3); border-radius: 32px; padding: 60px 70px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); display: flex; flex-direction: column; gap: ${isMulti ? "30px" : "40px"}; }
    .country-header { display: flex; align-items: center; gap: 24px; }
    .flag-box { width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 4px solid rgb(${theme.primary}); background-color: #1e293b; }
    .country-name { font-size: 36px; font-weight: 800; color: #cbd5e1; text-transform: uppercase; letter-spacing: 2px; }
    .text-gradient { background: linear-gradient(to right, rgb(${theme.primary}), rgb(${theme.secondary})); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .indice-row { display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 16px; }
    .indice-info { display: flex; flex-direction: column; gap: 4px; }
    .metrics-container { display: flex; align-items: center; gap: 24px; }
    .indice-title-multi { font-size: 56px; font-weight: 900; line-height: 1; letter-spacing: -1px; }
    .metric-value-multi { font-size: 42px; font-weight: 800; color: #ffffff; font-family: 'JetBrains Mono'; }
    .trend-badge-multi { font-size: 32px; padding: 12px 24px; border-radius: 16px; }
    .trend-value-multi { font-family: 'JetBrains Mono'; font-size: 32px; font-weight: 800; }
    .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; width: 100%; }
    .metric-block { display: flex; flex-direction: column; gap: 8px; }
    .indice-title-single { font-size: 96px; font-weight: 900; line-height: 1; letter-spacing: -2px; }
    .metric-value-single { font-size: 64px; font-weight: 800; color: #ffffff; font-family: 'JetBrains Mono'; }
    .metric-value-secondary { font-size: 48px; font-weight: 700; color: #cbd5e1; font-family: 'JetBrains Mono'; }
    .trend-badge-single { font-size: 48px; padding: 20px 40px; border-radius: 20px; }
    .trend-value-single { font-family: 'JetBrains Mono'; font-size: 48px; font-weight: 800; }
    .metric-label { font-family: 'JetBrains Mono'; font-size: 16px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .trend-badge { display: inline-flex; align-items: center; gap: 12px; border: 1px solid; }
    .divider { width: 100%; height: 2px; background: rgba(255,255,255,0.1); }
    .footer { width: 100%; display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 10; border-top: 2px solid rgba(255,255,255,0.1); padding-top: 25px; }
    .social-block { display: flex; align-items: center; gap: 12px; font-size: 16px; font-weight: 700; color: #94a3b8; }
    .social-icons { display: flex; gap: 10px; }
    .social-icons img { width: 20px; height: 20px; filter: invert(1); opacity: 0.8; }
    .disclaimer { font-family: 'JetBrains Mono'; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
  </style>
</head>
<body>
  <div class="background-gradient"></div>
  <div class="glow-orb"></div>
  <div class="top-right-badge">
    <div class="badge-title">Global Market Closing</div>
    <div class="badge-date">${marketDate}</div>
  </div>
  <div class="main-content">
    <div class="glass-card">
      <div class="country-header">
        <div class="flag-box"><img src="${marketData.flag}" alt="Flag" style="width: 100%; height: 100%; object-fit: cover;" /></div>
        <div class="country-name">${marketData.country}</div>
      </div>
      ${indicesHtml}
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
    <div class="disclaimer">Global Markets • Daily Update</div>
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
    const imageUrl = await uploadBufferToImgBB(imageBuffer);
    return imageUrl;
  } catch (error) {
    console.error(
      "generateIndiceImage processing error: ",
      (error as Error).message,
    );
    return "";
  } finally {
    await page?.close().catch(() => {});
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
  }
}
