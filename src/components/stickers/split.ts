import type { StickerTemplate, StickerConfig } from "./types";
import { getColors, fillRoundedRect, strokeRoundedRect, drawTextCentered } from "./shared";

const S = 2;
const W = 420 * S;
const H = 420 * S;

function render(ctx: CanvasRenderingContext2D, config: StickerConfig) {
  const c = getColors(config.theme);

  if (config.theme === "dark") {
    fillRoundedRect(ctx, 0, 0, W, H, 24 * S, c.bg);
    strokeRoundedRect(ctx, 0, 0, W, H, 24 * S, c.border, S);
  }

  const cx = W / 2;
  const cy = H / 2;

  // Distance — top-left area
  ctx.font = `800 ${72 * S}px Outfit, sans-serif`;
  ctx.fillStyle = c.text;
  ctx.fillText(config.distanceKm, 50 * S, 160 * S);

  // Diagonal slash
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 3 * S;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 40 * S, cy + 60 * S);
  ctx.lineTo(cx + 40 * S, cy - 60 * S);
  ctx.stroke();

  // Pace — bottom-right area
  ctx.font = `800 ${72 * S}px Outfit, sans-serif`;
  ctx.fillStyle = c.text;
  const paceW = ctx.measureText(config.pace).width;
  ctx.fillText(config.pace, W - 50 * S - paceW, 320 * S);

  // Labels — italic serif, smaller
  ctx.font = `italic 400 ${20 * S}px 'Playfair Display', Georgia, serif`;
  ctx.fillStyle = c.textMuted;
  ctx.fillText("Distance", 52 * S, 185 * S);

  const pLabelW = ctx.measureText("Pace").width;
  ctx.fillText("Pace", W - 50 * S - pLabelW, 340 * S);

  // Bottom stats line
  const statsLine = `TIME ${config.duration}  ·  ${config.date}`;
  ctx.font = `400 ${12 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.textDim;
  ctx.letterSpacing = `${1 * S}px`;
  const slW = ctx.measureText(statsLine).width;
  ctx.fillText(statsLine, cx - slW / 2, H - 40 * S);
  ctx.letterSpacing = "0px";

  // Watermark
  ctx.font = `600 ${9 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.textDim;
  const wmW = ctx.measureText("LARIVIZ").width;
  ctx.fillText("LARIVIZ", cx - wmW / 2, H - 20 * S);
}

export const split: StickerTemplate = {
  id: "split",
  name: "Split",
  width: W,
  height: H,
  hasCustomText: false,
  render,
};
