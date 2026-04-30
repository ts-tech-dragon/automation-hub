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

const fbBase64 = fs.readFileSync(fbIconPath).toString("base64");
const igBase64 = fs.readFileSync(igIconPath).toString("base64");

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

    // console.log("data : ", data);

    const mid = Math.floor(data.length / 2);

    const dataSet1 = data.slice(0, mid);
    const dataSet2 = data.slice(mid);

    // 1. Create the HTML Template with Tailwind CSS for styling
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Inter', sans-serif; background-color: #0f172a; color: white; }
        .glow { text-shadow: 0 0 10px rgba(45, 212, 191, 0.5); }
        .row-alt { background-color: rgba(30, 41, 59, 0.5); }
      </style>
    </head>
    <body class="p-8 w-full">
      <div class="border border-slate-700 rounded-2xl overflow-hidden bg-slate-900/80 backdrop-blur-md">
        <div class="p-6 text-center border-b border-slate-700">
          <h1 class="text-3xl font-bold text-teal-400 glow tracking-tight uppercase">
            Daily Upcoming Earnings & Watchlist
          </h1>
          <p class="text-xl text-white-400 mt-2 font-mono"> ${dateStr}</p>
        </div>
        
      

        <div class="flex items-start justify-center gap-2">
          <table class="flex-1 text-left">
            <thead class="bg-teal-500/10 text-teal-300 uppercase text-md font-bold">
              <tr>
                <th class="px-8 py-4">Company Name</th>
                <th class="px-8 py-4 text-right">Market Cap (INR CR)</th>
                ${isEPSRequired && '<th class="px-8 py-4 text-right">EPS</th>'}
                <th class="px-8 py-4">Nifty 50</th>
              </tr>
            </thead>
            <tbody class="text-lg">
              ${dataSet1
                .map(
                  (stock, index) => `
                <tr class="${index % 2 === 0 ? "" : "row-alt"} border-b border-slate-800/50">
                  <td class="px-8 py-5 font-semibold text-slate-100">${stock.name}</td>
                  <td class="px-8 py-5 text-right font-mono">
                    <span class="inline-flex items-center gap-2">
                      <span class="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs">₹</span>
                      ${stock.marketCap}
                    </span>
                  </td>
                  ${
                    isEPSRequired &&
                    `<td class="px-8 py-5 text-right font-mono">
                    <span class="inline-flex items-center gap-2">
                      <span class="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs">₹</span>
                      ${stock.eps}
                    </span>
                  </td>`
                  }
                  <td class="px-8 py-5 text-right font-mono">
                    <span class="inline-flex items-center gap-2">
                      ${stock.isNifty ? "✅" : ""}
                    </span>
                  </td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          
          
          <table class="flex-1 text-left">
            <thead class="bg-teal-500/10 text-teal-300 uppercase text-md font-bold">
              <tr>
                <th class="px-8 py-4">Company Name</th>
                <th class="px-8 py-4 text-right">Market Cap (INR CR)</th>
                ${isEPSRequired && '<th class="px-8 py-4 text-right">EPS</th>'}
                <th class="px-8 py-4">Nifty 50</th>
              </tr>
            </thead>
            <tbody class="text-lg">
              ${dataSet2
                .map(
                  (stock, index) => `
                <tr class="${index % 2 === 0 ? "" : "row-alt"} border-b border-slate-800/50">
                  <td class="px-8 py-5 font-semibold text-slate-100">${stock.name}</td>
                  <td class="px-8 py-5 text-right font-mono">
                    <span class="inline-flex items-center gap-2">
                      <span class="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs">₹</span>
                      ${stock.marketCap}
                    </span>
                  </td>
                  ${
                    isEPSRequired &&
                    `<td class="px-8 py-5 text-right font-mono">
                    <span class="inline-flex items-center gap-2">
                      <span class="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs">₹</span>
                      ${stock.eps}
                    </span>
                  </td>`
                  }
                  <td class="px-8 py-5 text-right font-mono">
                    <span class="inline-flex items-center gap-2">
                      ${stock.isNifty ? "✅" : ""}
                    </span>
                  </td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>

        
        <div class="p-6 bg-slate-950/50 text-center text-slate-400 text-sm flex items-center justify-center gap-4">
            <div class="flex items-center gap-2">
            <img src="data:image/png;base64,${fbBase64}" style="width:20px;height:20px;" />
            <span>tsfinnews</span>
            </div>
            <div class="flex items-center gap-2">
            <img src="data:image/png;base64,${igBase64}" style="width:20px;height:20px;" />
            <span>@tsfinnews</span>
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
