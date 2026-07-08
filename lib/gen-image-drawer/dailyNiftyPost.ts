import {
  createCanvas,
  loadImage,
  registerFont,
  CanvasRenderingContext2D,
  Image,
} from "canvas";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Bundlers/deploy targets (esbuild, Vercel, Lambda, etc.) frequently break
// relative-path resolution for non-JS assets, which is the #1 real cause of
// "couldn't load font ... falling back to Sans" warnings — registerFont()
// fails silently if the path doesn't resolve, and Pango substitutes Sans.
const BUNDLED_FONT_PATH = path.join(
  __dirname,
  "../../assets/fonts/inter_bold.ttf",
);

// Known-good static TTF (not the variable-font build, which Pango/Cairo can
// mis-resolve). Used only as a fallback if the bundled file isn't found.
const INTER_FONT_URL =
  "https://raw.githubusercontent.com/rsms/inter/master/docs/font-files/Inter-Bold.ttf";

let fontReady: Promise<void> | null = null;

// Registers "Inter" under both weights so every ctx.font string resolves —
// whether it's "bold Npx Inter" or plain "Npx Inter". Memoized so the
// disk/network work only happens once per process.
function ensureFontRegistered(): Promise<void> {
  if (fontReady) return fontReady;

  fontReady = (async () => {
    let fontPath = BUNDLED_FONT_PATH;

    if (!fs.existsSync(fontPath)) {
      console.warn(
        `[dailyMarketWrap] Bundled font not found at ${fontPath} — downloading Inter as a fallback.`,
      );
      try {
        const cacheDir = path.join(os.tmpdir(), "tsfinnews-fonts");
        const cachedPath = path.join(cacheDir, "inter-bold.ttf");
        if (!fs.existsSync(cachedPath)) {
          fs.mkdirSync(cacheDir, { recursive: true });
          const res = await fetch(INTER_FONT_URL);
          if (!res.ok)
            throw new Error(`Download failed with status ${res.status}`);
          fs.writeFileSync(cachedPath, Buffer.from(await res.arrayBuffer()));
        }
        fontPath = cachedPath;
      } catch (err) {
        console.warn(
          "[dailyMarketWrap] Font download fallback also failed — text will render in the system default font:",
          err,
        );
        return;
      }
    }

    try {
      registerFont(fontPath, { family: "Inter", weight: "normal" });
      registerFont(fontPath, { family: "Inter", weight: "bold" });
    } catch (err) {
      console.warn("[dailyMarketWrap] registerFont threw:", err);
    }
  })();

  return fontReady;
}

const DEFAULT_BG_PATH = path.join(__dirname, "../../assets/bg/bull-bear.jpg");

export interface StockData {
  date: string;
  headline: string;
  points: string[];
  indian_momentum: string;
  global_momentum: string;
  overall_impact: string;
  caption: string;
}

export interface SocialIcons {
  facebook?: string;
  instagram?: string;
  threads?: string;
  x?: string;
}

export interface GenerateOptions {
  /** Absolute or relative path to the bull-bear background image. */
  bgImagePath?: string;
  /** Base64 strings (or file paths) for footer social icons. Any missing key is skipped gracefully. */
  icons?: SocialIcons;
  /** Set false to use the sharp image instead of the soft blur. Default true. */
  blurBackground?: boolean;
}

// ---------------------------------------------------------------------------
// Theme — accent color reflects sentiment; everything else stays dark-glass
// so it always sits well on top of the bull/bear art.
// ---------------------------------------------------------------------------

type Sentiment = "bull" | "bear" | "neutral";

interface Theme {
  accent: string;
  badgeFill: string;
}

const THEMES: Record<Sentiment, Theme> = {
  bull: { accent: "#4ADE80", badgeFill: "rgba(22,163,74,0.9)" },
  bear: { accent: "#F87171", badgeFill: "rgba(220,38,38,0.9)" },
  neutral: { accent: "#38BDF8", badgeFill: "rgba(2,132,199,0.9)" },
};

const STATIC = {
  green: "#4ADE80",
  red: "#F87171",
  white: "#FFFFFF",
  headline: "#F8FAFC",
  body: "#CBD5E1",
  divider: "rgba(255,255,255,0.18)",
  cardFill: "rgba(8,15,35,0.58)",
  cardBorder: "rgba(255,255,255,0.35)",
};

function getSentiment(overallImpact: string): Sentiment {
  const t = overallImpact.toLowerCase();
  if (t.includes("bull")) return "bull";
  if (t.includes("bear")) return "bear";
  return "neutral";
}

// overall_impact is a full sentence ("Bearish sentiment dominates as..."),
// not a single word — pull just the mood word out for the compact badge.
function extractSentimentLabel(overallImpact: string): string {
  const sentiment = getSentiment(overallImpact);
  if (sentiment === "bull") return "Bullish";
  if (sentiment === "bear") return "Bearish";
  return "Neutral";
}

// ---------------------------------------------------------------------------
// Low-level helpers
// ---------------------------------------------------------------------------

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  align: CanvasTextAlign = "left",
): number {
  ctx.textAlign = align;
  const words = text.split(" ");
  let line = "";
  let lastY = y;

  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + " ";
    if (ctx.measureText(test).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, lastY);
      line = words[i] + " ";
      lastY += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, lastY);
  return lastY;
}

function drawGlowText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  opts: {
    font: string;
    color: string;
    glow?: string;
    blur?: number;
    align?: CanvasTextAlign;
  },
) {
  ctx.save();
  ctx.font = opts.font;
  ctx.textAlign = opts.align ?? "center";
  ctx.fillStyle = opts.color;
  if (opts.glow) {
    ctx.shadowColor = opts.glow;
    ctx.shadowBlur = opts.blur ?? 20;
  }
  ctx.fillText(text, x, y);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Background — bull/bear art, soft-blurred, with a dark scrim for legibility.
// Blur is done via a cheap downscale/upscale pass rather than ctx.filter,
// since filter support varies across node-canvas builds.
// ---------------------------------------------------------------------------

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: Image,
  width: number,
  height: number,
) {
  const imgRatio = img.width / img.height;
  const targetRatio = width / height;
  let drawW: number, drawH: number, dx: number, dy: number;

  if (imgRatio > targetRatio) {
    drawH = height;
    drawW = height * imgRatio;
    dx = (width - drawW) / 2;
    dy = 0;
  } else {
    drawW = width;
    drawH = width / imgRatio;
    dx = 0;
    dy = (height - drawH) / 2;
  }

  ctx.drawImage(img, dx, dy, drawW, drawH);
}

function drawBlurredBackground(
  ctx: CanvasRenderingContext2D,
  img: Image,
  width: number,
  height: number,
) {
  const smallW = Math.max(1, Math.round(width * 0.08));
  const smallH = Math.max(1, Math.round(height * 0.08));
  const small = createCanvas(smallW, smallH);
  const sctx = small.getContext("2d");
  drawCoverImage(sctx, img, smallW, smallH);

  ctx.imageSmoothingEnabled = true;
  (ctx as any).imageSmoothingQuality = "high";
  ctx.drawImage(small as any, 0, 0, width, height);
}

function drawScrim(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, "rgba(4,9,24,0.55)");
  g.addColorStop(0.35, "rgba(4,9,24,0.6)");
  g.addColorStop(1, "rgba(4,9,24,0.84)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
}

// ---------------------------------------------------------------------------
// Icon system — simple flat vector icons, zero emoji-font dependency.
// ---------------------------------------------------------------------------

type IconType = "chart" | "news" | "globe" | "arrowUp" | "arrowDown" | "money";

function drawIconCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  borderColor: string,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = STATIC.white;
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 3;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 2;
  ctx.strokeStyle = borderColor;
  ctx.stroke();
  ctx.restore();
}

function drawIcon(
  ctx: CanvasRenderingContext2D,
  type: IconType,
  cx: number,
  cy: number,
  r: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  switch (type) {
    case "chart": {
      ctx.beginPath();
      ctx.moveTo(cx - r, cy + r * 0.4);
      ctx.lineTo(cx - r * 0.3, cy - r * 0.1);
      ctx.lineTo(cx + r * 0.1, cy + r * 0.3);
      ctx.lineTo(cx + r, cy - r * 0.7);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + r * 0.45, cy - r * 0.7);
      ctx.lineTo(cx + r, cy - r * 0.7);
      ctx.lineTo(cx + r, cy - r * 0.15);
      ctx.stroke();
      break;
    }
    case "news": {
      roundedRect(ctx, cx - r, cy - r * 0.75, r * 2, r * 1.5, 4);
      ctx.stroke();
      for (let i = 0; i < 3; i++) {
        const ly = cy - r * 0.3 + i * (r * 0.45);
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.6, ly);
        ctx.lineTo(cx + r * 0.6, ly);
        ctx.stroke();
      }
      break;
    }
    case "globe": {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 0.42, r, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r, cy);
      ctx.stroke();
      break;
    }
    case "arrowUp": {
      ctx.beginPath();
      ctx.moveTo(cx, cy + r);
      ctx.lineTo(cx, cy - r * 0.3);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - r * 0.55, cy + r * 0.1);
      ctx.lineTo(cx, cy - r * 0.7);
      ctx.lineTo(cx + r * 0.55, cy + r * 0.1);
      ctx.stroke();
      break;
    }
    case "arrowDown": {
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx, cy + r * 0.3);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - r * 0.55, cy - r * 0.1);
      ctx.lineTo(cx, cy + r * 0.7);
      ctx.lineTo(cx + r * 0.55, cy - r * 0.1);
      ctx.stroke();
      break;
    }
    case "money": {
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `bold ${Math.round(r * 1.1)}px Inter`;
      ctx.fillText("₹", cx, cy + 2);
      ctx.textBaseline = "alphabetic";
      break;
    }
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Header: title, date pill, sentiment badge, headline
// ---------------------------------------------------------------------------

function drawBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  rightX: number,
  y: number,
  theme: Theme,
) {
  ctx.save();
  ctx.font = "bold 22px Inter";
  const label = text.toUpperCase();
  const w = ctx.measureText(label).width + 48;
  const x = rightX - w;

  roundedRect(ctx, x, y, w, 52, 26);
  ctx.fillStyle = theme.badgeFill;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.stroke();

  ctx.fillStyle = STATIC.white;
  ctx.textAlign = "center";
  ctx.fillText(label, x + w / 2, y + 34);
  ctx.restore();
}

function drawDatePill(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  theme: Theme,
) {
  ctx.save();
  ctx.font = "bold 20px Inter";
  const w = ctx.measureText(text).width + 44;
  roundedRect(ctx, x, y, w, 46, 23);
  ctx.fillStyle = "rgba(15,23,42,0.55)";
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = theme.accent;
  ctx.stroke();
  ctx.fillStyle = STATIC.headline;
  ctx.textAlign = "left";
  ctx.fillText(text, x + 22, y + 30);
  ctx.restore();
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  width: number,
  theme: Theme,
  data: StockData,
): number {
  drawGlowText(ctx, "DAILY MARKET WRAP", width / 2, 95, {
    font: "bold 54px Inter",
    color: STATIC.white,
    glow: theme.accent,
    blur: 24,
  });

  drawDatePill(ctx, data.date, 60, 130, theme);

  const sentimentLabel = extractSentimentLabel(data.overall_impact);
  drawBadge(ctx, sentimentLabel, width - 60, 130, theme);

  ctx.save();
  ctx.fillStyle = STATIC.headline;
  ctx.font = "bold 40px Inter";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 14;
  const headlineEndY = wrapText(
    ctx,
    data.headline,
    width / 2,
    255,
    900,
    48,
    "center",
  );
  ctx.restore();

  const dividerY = headlineEndY + 45;
  ctx.strokeStyle = STATIC.divider;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(70, dividerY);
  ctx.lineTo(width - 70, dividerY);
  ctx.stroke();

  return dividerY;
}

// ---------------------------------------------------------------------------
// Grid: the 6 points from the AI summary, mapped 1:1 onto 6 glass cards
// ---------------------------------------------------------------------------

interface BoxDef {
  label1: string;
  label2: string;
  body: string;
  icon: IconType;
  accent: string;
}

function buildBoxDefs(data: StockData, theme: Theme): BoxDef[] {
  const p = data.points ?? [];
  return [
    {
      label1: "Top",
      label2: "Story",
      body: p[0] ?? "",
      icon: "chart",
      accent: theme.accent,
    },
    {
      label1: "Market",
      label2: "Move",
      body: p[1] ?? "",
      icon: "news",
      accent: theme.accent,
    },
    {
      label1: "Key",
      label2: "Update",
      body: p[2] ?? "",
      icon: "chart",
      accent: theme.accent,
    },
    {
      label1: "Sector",
      label2: "Winner",
      body: p[3] ?? "",
      icon: "arrowUp",
      accent: STATIC.green,
    },
    {
      label1: "Sector",
      label2: "Laggard",
      body: p[4] ?? "",
      icon: "arrowDown",
      accent: STATIC.red,
    },
    {
      label1: "Global",
      label2: "Cue",
      body: p[5] ?? "",
      icon: "globe",
      accent: theme.accent,
    },
  ];
}

function drawBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  def: BoxDef,
) {
  ctx.save();
  roundedRect(ctx, x, y, w, h, 18);
  ctx.fillStyle = STATIC.cardFill;
  ctx.fill();
  ctx.setLineDash([7, 6]);
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = STATIC.cardBorder;
  ctx.stroke();
  ctx.restore();

  const cx = x + w / 2;
  const iconR = 40;
  const iconCy = y + 68;

  drawIconCircle(ctx, cx, iconCy, iconR, def.accent);
  drawIcon(ctx, def.icon, cx, iconCy, iconR * 0.55, def.accent);

  ctx.textAlign = "center";
  ctx.fillStyle = def.accent;
  ctx.font = "bold 23px Inter";
  ctx.fillText(def.label1, cx, iconCy + iconR + 38);

  ctx.fillStyle = STATIC.headline;
  ctx.font = "bold 23px Inter";
  ctx.fillText(def.label2, cx, iconCy + iconR + 66);

  ctx.fillStyle = STATIC.body;
  ctx.font = "19px Inter";
  wrapText(ctx, def.body, cx, iconCy + iconR + 104, w - 36, 25, "center");
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  top: number,
  theme: Theme,
  data: StockData,
): number {
  const boxes = buildBoxDefs(data, theme);
  const marginX = 60;
  const gap = 20;
  const colW = (width - marginX * 2 - gap * 2) / 3;
  const rowH = 330;

  boxes.forEach((def, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = marginX + col * (colW + gap);
    const y = top + row * (rowH + gap);
    drawBox(ctx, x, y, colW, rowH, def);
  });

  return top + rowH * 2 + gap;
}

// ---------------------------------------------------------------------------
// Momentum strip
// ---------------------------------------------------------------------------

function drawMomentumLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  theme: Theme,
): number {
  ctx.fillStyle = theme.accent;
  ctx.font = "bold 24px Inter";
  ctx.textAlign = "left";
  ctx.fillText("•", x, y);

  ctx.fillStyle = STATIC.headline;
  ctx.font = "21px Inter";
  return wrapText(ctx, text, x + 24, y, maxWidth, 28, "left");
}

function drawMomentumStrip(
  ctx: CanvasRenderingContext2D,
  width: number,
  top: number,
  theme: Theme,
  data: StockData,
) {
  let y = top + 40;
  y = drawMomentumLine(ctx, data.indian_momentum, 70, y, 900, theme);
  y += 34;
  drawMomentumLine(ctx, data.global_momentum, 70, y, 900, theme);
}

// ---------------------------------------------------------------------------
// Footer: divider, social icon row, handle. Icons are optional — any key
// left blank in TSFINNEWS_ICONS is skipped instead of crashing the render.
// ---------------------------------------------------------------------------

async function loadIcon(value?: string): Promise<Image | null> {
  if (!value) return null;
  try {
    if (value.startsWith("data:")) {
      const base64 = value.split(",")[1] as any;
      return await loadImage(Buffer.from(base64, "base64"));
    }
    if (fs.existsSync(value)) {
      return await loadImage(value);
    }
    return await loadImage(Buffer.from(value, "base64"));
  } catch {
    return null;
  }
}

async function drawFooter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  icons?: SocialIcons,
) {
  ctx.strokeStyle = STATIC.divider;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(70, height - 115);
  ctx.lineTo(width - 70, height - 115);
  ctx.stroke();

  const order: Array<keyof SocialIcons> = [
    "facebook",
    "instagram",
    "threads",
    "x",
  ];
  const loaded = await Promise.all(order.map((k) => loadIcon(icons?.[k])));
  const available = loaded.filter((img): img is Image => img !== null);

  if (available.length) {
    const iconSize = 34;
    const gap = 22;
    const totalW = available.length * iconSize + (available.length - 1) * gap;
    let startX = width / 2 - totalW / 2;
    const iconY = height - 92;

    for (const img of available) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        startX + iconSize / 2,
        iconY + iconSize / 2,
        iconSize / 2,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fill();
      ctx.clip();
      ctx.drawImage(img, startX, iconY, iconSize, iconSize);
      ctx.restore();
      startX += iconSize + gap;
    }
  }

  ctx.fillStyle = STATIC.headline;
  ctx.font = "bold 24px Inter";
  ctx.textAlign = "center";
  ctx.fillText("@tsfinnews", width / 2, height - 35);
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function generateDailyMarketWrapImage(
  data: StockData,
  options: GenerateOptions = {},
): Promise<string> {
  const width = 1080;
  const height = 1350;

  await ensureFontRegistered();

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const sentiment = getSentiment(data.overall_impact);
  const theme = THEMES[sentiment];

  const bgPath = options.bgImagePath ?? DEFAULT_BG_PATH;
  try {
    const bgImg = await loadImage(bgPath);
    if (options.blurBackground === false) {
      drawCoverImage(ctx, bgImg, width, height);
    } else {
      drawBlurredBackground(ctx, bgImg, width, height);
    }
  } catch {
    // Background image missing/unreadable — fall back to a flat navy panel
    // so the render never crashes the pipeline.
    ctx.fillStyle = "#0B1220";
    ctx.fillRect(0, 0, width, height);
  }

  drawScrim(ctx, width, height);

  const dividerY = drawHeader(ctx, width, theme, data);
  const gridBottom = drawGrid(ctx, width, dividerY + 40, theme, data);
  drawMomentumStrip(ctx, width, gridBottom, theme, data);
  await drawFooter(ctx, width, height, options.icons);

  const buffer = canvas.toBuffer("image/jpeg", { quality: 1 });
  const outputPath = path.join(process.cwd(), "temp_post.jpeg");
  fs.writeFileSync(outputPath, buffer);

  return outputPath;
}

export default generateDailyMarketWrapImage;
