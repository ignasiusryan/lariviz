import type { StickerTemplate, StickerConfig } from "./types";
import { getColors, fillRoundedRect, strokeRoundedRect, drawWatermark } from "./shared";

// "Monument" — giant hollow/outlined distance number
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

  // Giant outlined distance number (stroke, no fill)
  ctx.font = `900 ${180 * S}px Outfit, sans-serif`;
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 2.5 * S;
  const numW = ctx.measureText(config.distanceKm).width;
  ctx.strokeText(config.distanceKm, cx - numW / 2, 300 * S);

  // Faint filled version behind for depth
  ctx.fillStyle = c.accentDim;
  ctx.fillText(config.distanceKm, cx - numW / 2, 300 * S);

  // "km" — small, offset to the right
  ctx.font = `300 ${28 * S}px Outfit, sans-serif`;
  ctx.fillStyle = c.textMuted;
  ctx.fillText("km", cx + numW / 2 - 20 * S, 320 * S);

  // Horizontal accent line
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 2 * S;
  ctx.beginPath();
  ctx.moveTo(cx - 80 * S, 360 * S);
  ctx.lineTo(cx + 80 * S, 360 * S);
  ctx.stroke();

  // Run name below line — serif italic
  ctx.font = `italic 400 ${22 * S}px 'Playfair Display', Georgia, serif`;
  ctx.fillStyle = c.text;
  const nameW = ctx.measureText(config.activity.name).width;
  ctx.fillText(config.activity.name, cx - nameW / 2, 400 * S);

  // Pace + duration at bottom
  ctx.font = `400 ${14 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.textDim;
  const bottomLine = `${config.pace} /km  ·  ${config.duration}  ·  ${config.date}`;
  const blW = ctx.measureText(bottomLine).width;
  ctx.fillText(bottomLine, cx - blW / 2, 450 * S);

  drawWatermark(ctx, 40 * S, H - 30 * S, c.textDim, 11 * S);
}

export const bigNumber: StickerTemplate = {
  id: "big-number",
  name: "Monument",
  width: W,
  height: H,
  hasCustomText: false,
  render,
};
