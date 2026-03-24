import type { StickerTemplate, StickerConfig } from "./types";
import { getColors, fillRoundedRect, strokeRoundedRect, drawWatermark } from "./shared";

// "Tag" — clean price-tag / badge aesthetic
const S = 2;
const W = 540 * S;
const H = 540 * S;

function render(ctx: CanvasRenderingContext2D, config: StickerConfig) {
  const c = getColors(config.theme);

  if (config.theme === "dark") {
    fillRoundedRect(ctx, 0, 0, W, H, 28 * S, c.bg);
    strokeRoundedRect(ctx, 0, 0, W, H, 28 * S, c.border, S);
  }

  const cx = W / 2;

  // Tag hole (circle at top)
  const holeY = 80 * S;
  ctx.strokeStyle = c.textDim;
  ctx.lineWidth = 2 * S;
  ctx.beginPath();
  ctx.arc(cx, holeY, 16 * S, 0, Math.PI * 2);
  ctx.stroke();

  // Small dot in center of hole
  ctx.fillStyle = c.textDim;
  ctx.beginPath();
  ctx.arc(cx, holeY, 3 * S, 0, Math.PI * 2);
  ctx.fill();

  // Vertical line from hole to content
  ctx.strokeStyle = c.border;
  ctx.lineWidth = S;
  ctx.beginPath();
  ctx.moveTo(cx, holeY + 16 * S);
  ctx.lineTo(cx, holeY + 50 * S);
  ctx.stroke();

  // Activity name
  ctx.font = `400 ${14 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.textMuted;
  const nameW = ctx.measureText(config.activity.name).width;
  ctx.fillText(config.activity.name, cx - nameW / 2, 170 * S);

  // Giant distance — the "price"
  ctx.font = `800 ${120 * S}px Outfit, sans-serif`;
  ctx.fillStyle = c.text;
  const distW = ctx.measureText(config.distanceKm).width;
  ctx.fillText(config.distanceKm, cx - distW / 2, 310 * S);

  // "KM" below — accent colored pill
  const kmPillW = 80 * S;
  const kmPillH = 34 * S;
  const kmPillY = 330 * S;
  fillRoundedRect(ctx, cx - kmPillW / 2, kmPillY, kmPillW, kmPillH, kmPillH / 2, c.accent);
  ctx.font = `700 ${16 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = config.theme === "dark" ? "#000" : "#fff";
  const kmTextW = ctx.measureText("KM").width;
  ctx.fillText("KM", cx - kmTextW / 2, kmPillY + 23 * S);

  // Stats below
  ctx.font = `400 ${14 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.textDim;
  const line1 = `${config.pace} /km  ·  ${config.duration}`;
  const l1w = ctx.measureText(line1).width;
  ctx.fillText(line1, cx - l1w / 2, 410 * S);

  const line2 = `${config.dayOfWeek} ${config.date}`;
  const l2w = ctx.measureText(line2).width;
  ctx.fillText(line2, cx - l2w / 2, 438 * S);

  drawWatermark(ctx, 40 * S, H - 28 * S, c.textDim, 9 * S);
}

export const minimal: StickerTemplate = {
  id: "minimal",
  name: "Tag",
  width: W,
  height: H,
  hasCustomText: false,
  render,
};
