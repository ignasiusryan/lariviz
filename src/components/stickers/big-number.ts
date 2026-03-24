import type { StickerTemplate, StickerConfig } from "./types";
import { getColors, fillRoundedRect, strokeRoundedRect, drawTextCentered, drawWatermark } from "./shared";

// Giant distance number, "kilometers" in italic serif below
const S = 2; // retina scale
const W = 540 * S;
const H = 380 * S;

function render(ctx: CanvasRenderingContext2D, config: StickerConfig) {
  const c = getColors(config.theme);
  const pad = 40 * S;

  // Background
  if (config.theme === "dark") {
    fillRoundedRect(ctx, 0, 0, W, H, 24 * S, c.bg);
    strokeRoundedRect(ctx, 0, 0, W, H, 24 * S, c.border, S);
  }

  const cx = W / 2;

  // "DISTANCE" label
  ctx.font = `600 ${14 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.textDim;
  ctx.letterSpacing = `${4 * S}px`;
  const labelW = ctx.measureText("DISTANCE").width;
  ctx.fillText("DISTANCE", cx - labelW / 2, 60 * S);
  ctx.letterSpacing = "0px";

  // Big distance number
  const dist = config.distanceKm;
  ctx.font = `800 ${120 * S}px Outfit, sans-serif`;
  ctx.fillStyle = c.text;
  const numW = ctx.measureText(dist).width;
  ctx.fillText(dist, cx - numW / 2, 195 * S);

  // "kilometers" in italic serif
  ctx.font = `italic 400 ${28 * S}px 'Playfair Display', Georgia, serif`;
  ctx.fillStyle = c.textMuted;
  const kmW = ctx.measureText("kilometers").width;
  ctx.fillText("kilometers", cx - kmW / 2, 240 * S);

  // Divider line
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 2 * S;
  ctx.beginPath();
  ctx.moveTo(cx - 30 * S, 270 * S);
  ctx.lineTo(cx + 30 * S, 270 * S);
  ctx.stroke();

  // Run name + pace
  const subtext = `${config.pace} /km  ·  ${config.duration}`;
  drawTextCentered(ctx, subtext, cx, 310 * S, `400 ${14 * S}px 'JetBrains Mono', monospace`, c.textDim);

  // Watermark
  drawWatermark(ctx, pad, H - 28 * S, c.textDim, 12 * S);
}

export const bigNumber: StickerTemplate = {
  id: "big-number",
  name: "Big Number",
  width: W,
  height: H,
  hasCustomText: false,
  render,
};
