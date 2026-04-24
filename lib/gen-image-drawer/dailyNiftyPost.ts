import {
  createCanvas,
  loadImage,
  registerFont,
  CanvasRenderingContext2D,
} from "canvas";
import { fileURLToPath } from "node:url"; // Stick with node: prefix!
import path from "node:path";
import fs from "node:fs";
import { instaMarketSummaryPostTheme } from "../constants/theme.js";

// This is the "Magic" that brings back __dirname functionality
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// NOW this will work:
registerFont(path.join(__dirname, "../../assets/fonts/inter_bold.ttf"), {
  family: "Inter",
});

interface StockData {
  date: string;
  headline: string;
  points: string[]; // ["1. ...", "2. ...", "3. ..."]
  indian_momentum: string;
  global_momentum: string;
  overall_impact: string;
  caption: string;
}

export async function generateProfessionalSlide(
  data: StockData,
): Promise<string> {
  const width = 1080;
  const height = 1350; // 4:5 Aspect Ratio
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 2. Pick a random theme object
  const themeIndex = Math.floor(
    Math.random() * instaMarketSummaryPostTheme.length,
  );
  const activeTheme = instaMarketSummaryPostTheme[
    themeIndex
  ] as (typeof instaMarketSummaryPostTheme)[number];

  // Then in your ctx.font calls, use:
  ctx.font = "bold 55px InterCustom";

  // 1. DRAW BACKGROUND
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, "#001a1a");
  bgGrad.addColorStop(1, "#000000");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. DRAW NEON ACCENT BORDER
  ctx.strokeStyle = activeTheme.main;
  ctx.lineWidth = 10;
  ctx.strokeRect(35, 35, width - 70, height - 70);

  // 3. DRAW DATE (Top Left)
  ctx.fillStyle = activeTheme.main;
  ctx.font = "bold 26px Inter";
  ctx.textAlign = "left";
  ctx.fillText(`DATE: ${data.date}`, 75, 90);

  // 2. ADD this branding block near the "Date" drawing section:

  // --- TOP RIGHT BRANDING ---
  const logoSize = 35;
  const rightMargin = 1000; // Far right
  const topMargin = 85;

  try {
    // Load Logos
    const igLogo = await loadImage(
      path.join(__dirname, "../../assets/icons/ig_icon.png"),
    );
    const fbLogo = await loadImage(
      path.join(__dirname, "../../assets/icons/fb_icon.png"),
    );

    // Draw Logos (aligned to the right)
    ctx.drawImage(igLogo, 780, topMargin - 25, logoSize, logoSize);
    ctx.drawImage(fbLogo, 830, topMargin - 25, logoSize, logoSize);

    // Draw Handle Text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px Inter";
    ctx.textAlign = "left";
    ctx.fillText("@tsfinnews", 880, topMargin);
  } catch (e) {
    console.log("⚠️ Branding logos not found. Skipping branding section.");
  }

  // 4. DRAW HEADLINE
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 55px Inter";
  ctx.textAlign = "center";
  // Note: Your headline is often long, so we wrap it
  wrapText(ctx, data.headline.toUpperCase(), width / 2, 190, 920, 65);

  // 5. DRAW 3D CHARACTER (Behind panels for depth)
  try {
    const character = await loadImage(
      path.resolve("assets/characters/character1.png"),
    );
    // 1. Get original dimensions
    const originalWidth = character.width;
    const originalHeight = character.height;

    // 2. Define a target HEIGHT that fits your design
    const targetH = 800; // This seems to work well for vertical space

    // 3. Calculate the new width using the original aspect ratio
    //    newWidth = targetH * (originalWidth / originalHeight)
    const targetW = targetH * (originalWidth / originalHeight);

    // 4. Update the drawImage call with the calculated dimensions
    //    (dx, dy, new calculated width, defined target height)
    //    We've shifted him left (to x=510) and up (to y=260) based on your last success.
    ctx.drawImage(character, 250, 220, targetW, targetH);
  } catch (e) {
    console.log("⚠️ character.png not found. Drawing panels only.");
  }

  // 6. DRAW THREE MAIN POINTS (Glassmorphism Panels)
  let currentY = 340;
  data.points.forEach((point) => {
    drawGlassPanel(ctx, 75, currentY, 600, 185);

    ctx.textAlign = "left";
    ctx.font = "22px Inter";
    ctx.fillStyle = "#ffffff";
    // Wrap the point text inside the panel
    wrapText(ctx, point, 105, currentY + 55, 540, 34);

    currentY += 215;
  });

  // 7. DRAW MOMENTUM BOXES (Bottom Row)
  // Left: Indian Momentum
  drawGlassPanel(ctx, 75, 990, 455, 260);
  ctx.fillStyle = activeTheme.main;
  ctx.font = "bold 22px Inter";
  ctx.fillText("INDIAN MARKET WRAP", 105, 1035);
  ctx.fillStyle = "#cccccc";
  ctx.font = "19px Inter";
  wrapText(ctx, data.indian_momentum, 105, 1075, 395, 28);

  // Right: Global Momentum
  drawGlassPanel(ctx, 550, 990, 455, 260);
  ctx.fillStyle = activeTheme.main;
  ctx.font = "bold 22px Inter";
  ctx.fillText("GLOBAL CUES BRIEF", 580, 1035);
  ctx.fillStyle = "#cccccc";
  ctx.font = "19px Inter";
  wrapText(ctx, data.global_momentum, 580, 1075, 395, 28);

  // 9. WATERMARK
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.font = "22px Inter";
  ctx.textAlign = "center";
  ctx.fillText("@tsfinnews", width / 2, 1335);

  // EXPORT TO FILE
  const buffer = canvas.toBuffer("image/jpeg", { quality: 1 });
  const outputPath = path.join(process.cwd(), "temp_post.jpeg");
  fs.writeFileSync(outputPath, buffer);

  return outputPath;
}

// --- HELPER TOOLS ---

function drawGlassPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.save();
  // Panel Glow
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 15;
  // Semi-transparent panel fill
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 20);
  ctx.fill();
  // Thin Cyan Border
  ctx.strokeStyle = "rgba(0, 255, 255, 0.25)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
