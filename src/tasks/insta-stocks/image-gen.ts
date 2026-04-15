import { createCanvas, loadImage, registerFont } from "canvas";
import fs from "node:fs";
import path from "node:path";
import { INSTA_PAGE_NAME } from "../../../lib/constants/index.js";

export async function createStockPost(headline: string, points: string[]) {
  // Safety Check
  if (!headline) headline = "MARKET UPDATE";
  if (!points || points.length === 0) points = [""];

  const width = 1080;
  const height = 1080;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 1. Load Background
  const bgPath = path.resolve("assets/insta-bg.png");
  const background = await loadImage(bgPath);
  ctx.drawImage(background, 0, 0, width, height);

  // 2. Add an Overlay (Darken the background for better text readability)
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, width, height);

  // 3. Draw Headline
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 60pt Arial";
  ctx.textAlign = "center";

  // Wrap text if headline is long
  const maxWidth = 900;
  ctx.fillText(headline.toUpperCase(), width / 2, 300, maxWidth);

  // 4. Draw Bullet Points
  ctx.font = "35pt Arial";
  ctx.textAlign = "left";
  const startY = 450;
  const spacing = 120;

  points.forEach((point, index) => {
    const y = startY + index * spacing;
    // Draw a small icon or bullet
    ctx.fillStyle = "#00FFCC"; // Teal/Green color for the bullet
    ctx.fillText("●", 100, y);

    // Draw the text
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(point, 160, y, 800);
  });

  // 5. Add your Branding (Footer)
  ctx.font = "italic 25pt Arial";
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.textAlign = "center";
  ctx.fillText(INSTA_PAGE_NAME, width / 2, 1000);

  // 6. Save the file
  const buffer = canvas.toBuffer("image/png");
  const outputPath = path.resolve("temp_post.png");
  fs.writeFileSync(outputPath, buffer);

  console.log(`🖼️ Post image created at: ${outputPath}`);
  return outputPath;
}
