import { TSFINNEWS_ICONS } from "../../../lib/constants/index.js";
import { EARNINGS_POST_THEMES } from "../../../lib/constants/theme.js";
import { uploadBufferToImgBB } from "../../core/imgbb.js";
import { scrapperBrowser } from "../../core/scrapper/index.js";

const activeTheme: any =
  EARNINGS_POST_THEMES[Math.floor(Math.random() * EARNINGS_POST_THEMES.length)];

export const generateMarketPulseImage = async (
  item: {
    title: string;
    description: string;
    sentiment: string;
    entity: string;
  },
  dateStr: string,
) => {
  const { page, context, browser } = await scrapperBrowser();
  try {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            /* Use your activeTheme object variables here */
            --primary-rgb: ${activeTheme.primary};
            --accent-rgb: ${activeTheme.accent};
            --header-gradient: ${activeTheme.gradient};
        }

        * { box-sizing: border-box; }
        
        body {
            font-family: 'Inter', sans-serif;
            background: #050810;
            margin: 0; padding: 0;
            color: white;
        }

        /* Container for Playwright to screenshot (1080x1080) */
        .slide {
            width: 1080px;
            height: auto;
            background: radial-gradient(circle at 20% 20%, #0d2137 0%, #050810 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }

        /* The Glass Card */
        .glass-card {
            width: 920px;
            height: 920px;
            background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);
            border: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(30px);
            border-radius: 60px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 50px 100px rgba(0,0,0,0.5);
            position: relative;
        }

        .header-section {
            background: var(--header-gradient);
            padding: 50px 20px;
            text-align: center;
            border-bottom: 1px solid rgba(var(--primary-rgb), 0.2);
            position: relative;
        }

        .title-glow {
            font-size: 3.2rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: rgba(var(--primary-rgb), 1);
            text-shadow: 0 0 30px rgba(var(--primary-rgb), 0.5);
            margin-bottom: 15px;
        }

        .date-pill {
            display: inline-block;
            background: rgba(var(--primary-rgb), 0.1);
            border: 1px solid rgba(var(--primary-rgb), 0.3);
            color: rgba(var(--accent-rgb), 1);
            padding: 8px 30px;
            border-radius: 999px;
            font-size: 1.2rem;
            font-weight: 600;
        }

        .title-main {
            font-size: 4.5rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: rgba(var(--primary-rgb), 1);
            text-shadow: 0 0 40px rgba(var(--primary-rgb), 0.4);
            margin: 0;
        }

        .content-body {
            padding: 60px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .news-headline {
            font-size: 2.8rem;
            font-weight: 700;
            line-height: 1.2;
            color: #ffffff;
            margin-bottom: 30px;
            border-left: 10px solid rgba(var(--primary-rgb), 1);
            padding-left: 30px;
        }

        .news-description {
            font-size: 1.6rem;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.7);
            padding-left: 40px;
        }

        .footer {
            padding: 40px;
            display: flex;
            justify-content: center;
            gap: 30px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            font-size: 1.2rem;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.4);
        }

        .sentiment-tag {
            position: absolute;
            top: 40px;
            right: 40px;
            background: rgba(var(--primary-rgb), 0.2);
            border: 1px solid rgba(var(--primary-rgb), 0.5);
            color: white;
            padding: 10px 25px;
            border-radius: 999px;
            font-weight: 700;
            font-size: 1.1rem;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="slide">
        <div class="glass-card">
            <div class="header-section">
                <h1 class="title-glow">Daily Market Pulse</h1>
                <div class="date-pill">${dateStr}</div>
            </div> 
            <div class="content-body">
                <div class="news-headline">
                    ${item.title}
                </div>
                <div class="news-description">
                    ${item.description}
                </div>
            </div>

            <div class="footer-glass" style="display: flex; align-items: center; justify-content: center; gap: 24px;font-size: 1.2rem; color: rgba(255,255,255,0.4);">
                <div class="footer-item flex items-center gap-2">
                <img src="data:image/png;base64,${TSFINNEWS_ICONS.facebook}" style="width:24px;height:24px;" />
                <span>tsfinnews</span>
                </div>
                
                <div class="footer-item flex items-center gap-2">
                <img src="data:image/png;base64,${TSFINNEWS_ICONS.instagram}" style="width:24px;height:24px;" />
                <span>@tsfinnews</span>
                </div>

                <div class="footer-item flex items-center gap-2">
                <img src="data:image/png;base64,${TSFINNEWS_ICONS.threads}" style="width:24px;height:24px;" />
                <span>tsfinnews</span>
                </div>
            </div>
    </div>

</body>
</html>`;

    // 2. Load the HTML into the page
    await page.setContent(htmlContent);

    // 3. Take a screenshot of the specific element
    const container = await page.locator(".glass-card");
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
      "Error generating Market Pulse image:",
      (error as Error).message,
    );
    return "";
  } finally {
    await page?.close().catch(() => {});
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
  }
};
