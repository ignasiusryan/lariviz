import type { StickerTemplate, StickerConfig } from "./types";
import { getColors, fillRoundedRect, strokeRoundedRect, drawWatermark } from "./shared";

// "Versus" — geometric diagonal split, distance vs pace
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

  // Diagonal line — accent colored, bold
  ctx.save();
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 3 * S;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(100 * S, H - 120 * S);
  ctx.lineTo(W - 100 * S, 120 * S);
  ctx.stroke();

  // Subtle glow on diagonal
  ctx.shadowColor = c.accent;
  ctx.shadowBlur = 20 * S;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(100 * S, H - 120 * S);
  ctx.lineTo(W - 100 * S, 120 * S);
  ctx.stroke();
  ctx.restore();

  // Top-left zone: DISTANCE
  ctx.font = `800 ${80 * S}px Outfit, sans-serif`;
  ctx.fillStyle = c.text;
  ctx.fillText(config.distanceKm, 55 * S, 200 * S);

  ctx.font = `italic 300 ${20 * S}px 'Playfair Display', Georgia, serif`;
  ctx.fillStyle = c.textMuted;
  ctx.fillText("kilometers", 58 * S, 232 * S);

  // Bottom-right zone: PACE
  ctx.font = `800 ${80 * S}px Outfit, sans-serif`;
  ctx.fillStyle = c.text;
  const paceW = ctx.measureText(config.pace).width;
  ctx.fillText(config.pace, W - 55 * S - paceW, 410 * S);

  ctx.font = `italic 300 ${20 * S}px 'Playfair Display', Georgia, serif`;
  ctx.fillStyle = c.textMuted;
  const paceLabel = "per km";
  const plW = ctx.measureText(paceLabel).width;
  ctx.fillText(paceLabel, W - 55 * S - plW, 442 * S);

  // "VS" badge on the diagonal
  const vsX = cx;
  const vsY = H / 2;
  const vsR = 28 * S;
  fillRoundedRect(ctx, vsX - vsR, vsY - vsR, vsR * 2, vsR * 2, vsR, c.accent);
  ctx.font = `800 ${18 * S}px Outfit, sans-serif`;
  ctx.fillStyle = config.theme === "dark" ? "#000" : "#fff";
  const vsW = ctx.measureText("VS").width;
  ctx.fillText("VS", vsX - vsW / 2, vsY + 7 * S);

  // Duration + date at bottom
  ctx.font = `400 ${12 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.textDim;
  const footer = `${config.duration}  ·  ${config.dayOfWeek} ${config.date}`;
  const fw = ctx.measureText(footer).width;
  ctx.fillText(footer, cx - fw / 2, H - 40 * S);

  drawWatermark(ctx, 40 * S, H - 24 * S, c.textDim, 9 * S);
}

export const split: StickerTemplate = {
  id: "split",
  name: "Versus",
  width: W,
  height: H,
  hasCustomText: false,
  render,
};
