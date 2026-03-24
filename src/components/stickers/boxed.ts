import type { StickerTemplate, StickerConfig } from "./types";
import { getColors, fillRoundedRect, strokeRoundedRect, drawWatermark } from "./shared";

// "Viewfinder" — camera viewfinder with crosshairs, stats in quadrants
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
  const cy = H / 2;
  const inset = 50 * S;

  // Viewfinder corners (L-shaped brackets, thicker)
  const bLen = 40 * S;
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 2.5 * S;
  ctx.lineCap = "square";

  // Top-left
  ctx.beginPath();
  ctx.moveTo(inset, inset + bLen);
  ctx.lineTo(inset, inset);
  ctx.lineTo(inset + bLen, inset);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(W - inset - bLen, inset);
  ctx.lineTo(W - inset, inset);
  ctx.lineTo(W - inset, inset + bLen);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(inset, H - inset - bLen);
  ctx.lineTo(inset, H - inset);
  ctx.lineTo(inset + bLen, H - inset);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(W - inset - bLen, H - inset);
  ctx.lineTo(W - inset, H - inset);
  ctx.lineTo(W - inset, H - inset - bLen);
  ctx.stroke();

  // Center crosshair
  const crossSize = 16 * S;
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 1.5 * S;
  ctx.globalAlpha = 0.4;
  // Vertical
  ctx.beginPath();
  ctx.moveTo(cx, cy - crossSize);
  ctx.lineTo(cx, cy + crossSize);
  ctx.stroke();
  // Horizontal
  ctx.beginPath();
  ctx.moveTo(cx - crossSize, cy);
  ctx.lineTo(cx + crossSize, cy);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Title (custom or activity name) — top center
  const title = config.customText || config.activity.name;
  ctx.font = `600 ${18 * S}px Outfit, sans-serif`;
  ctx.fillStyle = c.text;
  const titleW = ctx.measureText(title).width;
  ctx.fillText(title, cx - titleW / 2, inset + 70 * S);

  // Date below title
  ctx.font = `400 ${12 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.textDim;
  const dateStr = `${config.dayOfWeek.toUpperCase()} · ${config.date.toUpperCase()}`;
  const dw = ctx.measureText(dateStr).width;
  ctx.fillText(dateStr, cx - dw / 2, inset + 95 * S);

  // Giant distance — center
  ctx.font = `800 ${110 * S}px Outfit, sans-serif`;
  ctx.fillStyle = c.text;
  const distW = ctx.measureText(config.distanceKm).width;
  ctx.fillText(config.distanceKm, cx - distW / 2, cy + 40 * S);

  // "km" unit beside
  ctx.font = `300 ${24 * S}px Outfit, sans-serif`;
  ctx.fillStyle = c.textMuted;
  ctx.fillText("km", cx + distW / 2 + 6 * S, cy + 40 * S);

  // Bottom stats — pace | time
  ctx.font = `500 ${15 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.textMuted;
  const statsStr = `${config.pace} /km   ·   ${config.duration}`;
  const sw = ctx.measureText(statsStr).width;
  ctx.fillText(statsStr, cx - sw / 2, H - inset - 40 * S);

  // REC indicator dot (top-right)
  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.arc(W - inset - 12 * S, inset + 20 * S, 4 * S, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = `600 ${10 * S}px 'JetBrains Mono', monospace`;
  ctx.fillText("REC", W - inset - 40 * S, inset + 24 * S);

  drawWatermark(ctx, inset + 6 * S, H - inset - 10 * S, c.textDim, 9 * S);
}

export const boxed: StickerTemplate = {
  id: "boxed",
  name: "Viewfinder",
  width: W,
  height: H,
  hasCustomText: true,
  defaultText: "",
  textPlaceholder: "Run title",
  render,
};
