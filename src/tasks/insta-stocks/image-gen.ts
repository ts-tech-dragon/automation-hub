import { createCanvas, loadImage } from "canvas";
import fs from "node:fs";
import path from "node:path";
import { INSTA_PAGE_NAME } from "../../../lib/constants/index.js";
import { measureTextHeight } from "../../../lib/helpers/index.js";
import { instaMarketSummaryPostTheme } from "../../../lib/constants/theme.js";

// --- TEXT WRAPPING HELPER ---
function wrapText(
  ctx: any,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n] + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  return currentY + lineHeight;
}

export async function createStockPost(data: any) {
  const {
    headline,
    points,
    indian_momentum,
    global_momentum,
    overall_impact,
    date,
  } = data;

  const width = 1080;
  const height = 1350;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 2. Pick a random theme object
  const themeIndex = Math.floor(
    Math.random() * instaMarketSummaryPostTheme.length,
  );
  const activeTheme = instaMarketSummaryPostTheme[
    themeIndex
  ] as (typeof instaMarketSummaryPostTheme)[number];

  // 1. Background (Unchanged)
  try {
    const background = await loadImage(path.resolve(activeTheme.bg));
    ctx.drawImage(background, 0, 0, width, height);
  } catch (e) {
    ctx.fillStyle = "#0A0A0A";
    ctx.fillRect(0, 0, width, height);
  }

  // --- 2. THE IMPROVED PANEL (LARGER BOX) ---
  const panelX = 60;
  const panelY = 120; // Moved up slightly
  const panelWidth = 960;
  const panelHeight = 1150; // Increased height significantly

  ctx.fillStyle = "rgba(10, 10, 10, 0.92)";
  if (ctx.roundRect) ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 30);
  else ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
  ctx.fill();

  ctx.strokeStyle = activeTheme.main;
  ctx.lineWidth = 4;
  ctx.shadowBlur = 20;
  ctx.shadowColor = activeTheme.main;
  ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
  ctx.shadowBlur = 0;

  // --- 3. DYNAMIC CONTENT ---

  // Date
  ctx.fillStyle = activeTheme.date;
  ctx.font = "bold 22pt Arial";
  ctx.textAlign = "left";
  ctx.fillText(`DATE: ${date || "16-04-2026"}`, panelX + 40, panelY - 20);

  // 📉 HEADLINE (SMALLER TO SAVE SPACE)
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 24pt Arial"; // Reduced from 58pt
  ctx.textAlign = "center";
  // Reduced line height to 65 to keep it compact
  let nextY = wrapText(
    ctx,
    headline.toUpperCase(),
    width / 2,
    panelY + 90,
    880,
    65,
  );

  // BULLET POINTS (SMALLER FONT & TIGHTER SPACING)
  ctx.textAlign = "left";
  ctx.font = "24pt Arial"; // Reduced from 30pt
  nextY += 20;

  points.forEach((point: string) => {
    ctx.fillStyle = activeTheme.main;
    ctx.fillText("●", panelX + 50, nextY);
    ctx.fillStyle = "#FFFFFF";
    // wrapText height reduced to 42 for a cleaner look
    nextY = wrapText(ctx, point, panelX + 100, nextY, 800, 42) + 20;
  });

  // --- CALCULATE AUTO HEIGHT ---
  const boxWidth = 390;
  const padding = 40; // Space for title and margins
  const lineHeight = 24;

  // Measure both
  const indianHeight = measureTextHeight(
    ctx,
    indian_momentum,
    boxWidth - 40,
    lineHeight,
  );
  const globalHeight = measureTextHeight(
    ctx,
    global_momentum,
    boxWidth - 40,
    lineHeight,
  );

  // "Auto Height" = The taller of the two + some extra room for the title (80px)
  const autoBoxHeight = Math.max(indianHeight, globalHeight) + 100;

  const boxY = nextY + 15;

  const drawMomentumBox = (x: number, title: string, text: string) => {
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fillRect(x, boxY, boxWidth, autoBoxHeight);
    ctx.fillStyle = activeTheme.main;
    ctx.font = "bold 14pt Arial";
    ctx.fillText(title, x + 20, boxY + 40);
    ctx.fillStyle = "#CCCCCC";
    ctx.font = "15pt Arial";
    wrapText(ctx, text, x + 20, boxY + 75, boxWidth - 40, 24);
  };

  drawMomentumBox(panelX + 50, "INDIAN MARKET", indian_momentum);
  drawMomentumBox(panelX + 520, "GLOBAL CUES", global_momentum);

  // --- 4. VERDICT BANNER (LOWER POSITION) ---
  // const bannerY = panelY + panelHeight - 100;
  // ctx.fillStyle = "#007230"; //"#00FFCC";
  // ctx.fillRect(panelX, bannerY, panelWidth, 70);
  // ctx.fillStyle = "#000000";
  // ctx.font = "bold 28pt Arial";
  // ctx.textAlign = "center";
  // ctx.fillText(
  //   `VERDICT: ${overall_impact.toUpperCase()}`,
  //   width / 2,
  //   bannerY + 48,
  // );

  // Footer
  ctx.font = "bold 20pt Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(INSTA_PAGE_NAME, width / 2, height - 40);

  // 5. Save
  const buffer = canvas.toBuffer("image/png");
  const outputPath = path.resolve("temp_post.png");
  fs.writeFileSync(outputPath, buffer);

  return outputPath;
}
