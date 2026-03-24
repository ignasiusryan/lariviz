import type { StickerTemplate, StickerConfig } from "./types";
import { getColors, fillRoundedRect, strokeRoundedRect, drawTextCentered, drawWatermark } from "./shared";

const S = 2;
const W = 480 * S;
const H = 480 * S;

function render(ctx: CanvasRenderingContext2D, config: StickerConfig) {
  const c = getColors(config.theme);
  const pad = 40 * S;

  if (config.theme === "dark") {
    fillRoundedRect(ctx, 0, 0, W, H, 24 * S, c.bg);
    strokeRoundedRect(ctx, 0, 0, W, H, 24 * S, c.border, S);
  }

  // Corner brackets
  const bracketLen = 50 * S;
  const bracketInset = 30 * S;
  const bracketColor = c.textDim;
  ctx.strokeStyle = bracketColor;
  ctx.lineWidth = 2 * S;
  ctx.lineCap = "square";

  // Top-left
  ctx.beginPath();
  ctx.moveTo(bracketInset, bracketInset + bracketLen);
  ctx.lineTo(bracketInset, bracketInset);
  ctx.lineTo(bracketInset + bracketLen, bracketInset);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(W - bracketInset - bracketLen, bracketInset);
  ctx.lineTo(W - bracketInset, bracketInset);
  ctx.lineTo(W - bracketInset, bracketInset + bracketLen);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(bracketInset, H - bracketInset - bracketLen);
  ctx.lineTo(bracketInset, H - bracketInset);
  ctx.lineTo(bracketInset + bracketLen, H - bracketInset);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(W - bracketInset - bracketLen, H - bracketInset);
  ctx.lineTo(W - bracketInset, H - bracketInset);
  ctx.lineTo(W - bracketInset, H - bracketInset - bracketLen);
  ctx.stroke();

  const cx = W / 2;

  // Run name (custom text or activity name) — italic serif
  const title = config.customText || config.activity.name;
  ctx.font = `italic 400 ${30 * S}px 'Playfair Display', Georgia, serif`;
  ctx.fillStyle = c.text;
  const titleW = ctx.measureText(title).width;
  ctx.fillText(title, cx - titleW / 2, 130 * S);

  // Date
  ctx.font = `600 ${12 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.textDim;
  ctx.letterSpacing = `${3 * S}px`;
  const dateStr = `${config.dayOfWeek.toUpperCase()} ${config.date.toUpperCase()}`;
  const dateW = ctx.measureText(dateStr).width;
  ctx.fillText(dateStr, cx - dateW / 2, 165 * S);
  ctx.letterSpacing = "0px";

  // Big distance
  ctx.font = `800 ${100 * S}px Outfit, sans-serif`;
  ctx.fillStyle = c.text;
  const distW = ctx.measureText(config.distanceKm).width;
  ctx.fillText(config.distanceKm, cx - distW / 2, 300 * S);

  // Stats line below
  const statsLine = `P: ${config.pace}   T: ${config.duration}`;
  ctx.font = `400 ${14 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.textDim;
  const statsW = ctx.measureText(statsLine).width;
  ctx.fillText(statsLine, cx - statsW / 2, 345 * S);

  // Watermark
  drawWatermark(ctx, pad + 10 * S, H - pad - 8 * S, c.textDim, 10 * S);
}

export const boxed: StickerTemplate = {
  id: "boxed",
  name: "Boxed",
  width: W,
  height: H,
  hasCustomText: true,
  defaultText: "",
  textPlaceholder: "Run title (e.g. Morning Run)",
  render,
};
