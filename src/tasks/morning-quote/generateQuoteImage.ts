import axios from "axios";
import { EARNINGS_POST_THEMES } from "../../../lib/constants/theme.js";
import { uploadBufferToImgBB } from "../../core/imgbb.js";
import { scrapperBrowser } from "../../core/scrapper/index.js";
import path from "node:path";
import fs from "node:fs";

// 1. Convert local icons to Base64 strings
// Adjust these paths based on where your script is running from
const fbIconPath = path.join(process.cwd(), "assets/icons/fb_icon.png");
const igIconPath = path.join(process.cwd(), "assets/icons/ig_icon.png");
const thIconPath = path.join(process.cwd(), "assets/icons/th_icon.png");

const fbBase64 = fs.readFileSync(fbIconPath).toString("base64");
const igBase64 = fs.readFileSync(igIconPath).toString("base64");
const thBase64 = fs.readFileSync(thIconPath).toString("base64");

const activeTheme: any =
  EARNINGS_POST_THEMES[Math.floor(Math.random() * EARNINGS_POST_THEMES.length)];

export const generateQuoteImage = async () => {
  const { page, context, browser } = await scrapperBrowser();
  try {
    const response = await axios.get("https://zenquotes.io/api/random");
    const quote = response.data?.[0];

    const quoteHtml = `
            <!DOCTYPE html>
            <html>
            <head>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&family=Playfair+Display:italic,wght@1,600&display=swap" rel="stylesheet">
            <style>
                :root { --primary-rgb: ${activeTheme.primary}; }
                body {
                margin: 0; padding: 0;
                background: radial-gradient(circle at center, #0f172a 0%, #020617 100%);
                height: 1080px; width: 1080px; /* Force Instagram Square */
                display: flex; align-items: center; justify-content: center;
                font-family: 'Inter', sans-serif; color: white;
                }
                .quote-card {
                width: 880px; height: 880px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(var(--primary-rgb), 0.3);
                backdrop-filter: blur(20px);
                border-radius: 40px;
                display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                padding: 80px; text-align: center;
                box-shadow: 0 0 80px rgba(var(--primary-rgb), 0.1);
                }
                .quote-text {
                font-family: 'Playfair Display', serif;
                font-size: 56px; line-height: 1.4;
                margin-bottom: 40px;
                background: linear-gradient(to bottom, #ffffff, rgba(var(--primary-rgb), 0.8));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                }
                .author {
                font-size: 28px; font-weight: 700;
                text-transform: uppercase; letter-spacing: 4px;
                color: rgba(var(--primary-rgb), 1);
                }
                .footer {
                position: absolute; bottom: 140px;
                font-size: 20px; color: rgba(255,255,255,0.4);
                }
            </style>
            </head>
            <body style="position: relative;display: flex; align-items: center; justify-content: center;">
            <div class="quote-card">
                <div style="font-size: 120px; color: rgba(var(--primary-rgb), 0.2); margin-bottom: -40px;">“</div>
                <div class="quote-text">${quote.q}</div>
                <div class="author">— ${quote.a}</div>

                <div class="footer-glass" style="display: flex; align-items: center; justify-content: center; gap: 24px;margin-top: 40px;">
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
            
            </body>
            </html>
            `;

    // 2. Load the HTML into the page
    await page.setContent(quoteHtml);

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

    return imageUrl;
  } catch (error) {
    console.error("generateQuoteImage:", (error as Error).message);
    return "";
  } finally {
    await page?.close().catch(() => {});
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
  }
};
