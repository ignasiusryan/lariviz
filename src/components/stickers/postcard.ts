import type { StickerTemplate, StickerConfig } from "./types";
import { getColors, fillRoundedRect, strokeRoundedRect, drawWatermark } from "./shared";

// "Passport" — vintage passport stamp look
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
  const cy = H / 2 - 10 * S;
  const location = config.customText || config.location || "Unknown";

  // Double circle border (stamp style)
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 3 * S;
  ctx.beginPath();
  ctx.arc(cx, cy, 200 * S, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 1.5 * S;
  ctx.beginPath();
  ctx.arc(cx, cy, 190 * S, 0, Math.PI * 2);
  ctx.stroke();

  // Location — curved text along top of circle
  const locationUpper = location.toUpperCase();
  ctx.font = `700 ${22 * S}px 'Playfair Display', Georgia, serif`;
  ctx.fillStyle = c.accent;

  const charWidths: number[] = [];
  for (const ch of locationUpper) {
    charWidths.push(ctx.measureText(ch).width);
  }
  const totalCharW = charWidths.reduce((a, b) => a + b, 0);
  const textR = 165 * S;
  const totalAngle = totalCharW / textR;
  let angle = -Math.PI / 2 - totalAngle / 2;

  ctx.save();
  for (let i = 0; i < locationUpper.length; i++) {
    const halfChar = charWidths[i] / 2;
    angle += halfChar / textR;
    ctx.save();
    ctx.translate(cx + textR * Math.cos(angle), cy + textR * Math.sin(angle));
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(locationUpper[i], -halfChar, 0);
    ctx.restore();
    angle += halfChar / textR;
  }
  ctx.restore();

  // Horizontal lines through center
  const lineY = cy;
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 1.5 * S;
  ctx.beginPath();
  ctx.moveTo(cx - 140 * S, lineY - 30 * S);
  ctx.lineTo(cx + 140 * S, lineY - 30 * S);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 140 * S, lineY + 30 * S);
  ctx.lineTo(cx + 140 * S, lineY + 30 * S);
  ctx.stroke();

  // Distance in center band
  ctx.font = `800 ${58 * S}px Outfit, sans-serif`;
  ctx.fillStyle = c.text;
  const distText = `${config.distanceKm} KM`;
  const dw = ctx.measureText(distText).width;
  ctx.fillText(distText, cx - dw / 2, cy + 18 * S);

  // Date along bottom curve
  const dateText = `${config.dayOfWeek.toUpperCase()} · ${config.date.toUpperCase()} · ${config.pace} /KM`;
  ctx.font = `500 ${12 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.textMuted;

  const dateChars: number[] = [];
  for (const ch of dateText) {
    dateChars.push(ctx.measureText(ch).width);
  }
  const dateTotalW = dateChars.reduce((a, b) => a + b, 0);
  const dateR = 165 * S;
  const dateTotalAngle = dateTotalW / dateR;
  let dateAngle = Math.PI / 2 - dateTotalAngle / 2;

  ctx.save();
  for (let i = 0; i < dateText.length; i++) {
    const halfChar = dateChars[i] / 2;
    dateAngle += halfChar / dateR;
    ctx.save();
    ctx.translate(cx + dateR * Math.cos(dateAngle), cy + dateR * Math.sin(dateAngle));
    ctx.rotate(dateAngle - Math.PI / 2);
    ctx.fillText(dateText[i], -halfChar, 0);
    ctx.restore();
    dateAngle += halfChar / dateR;
  }
  ctx.restore();

  drawWatermark(ctx, 40 * S, H - 24 * S, c.textDim, 9 * S);
}

export const postcard: StickerTemplate = {
  id: "postcard",
  name: "Passport",
  width: W,
  height: H,
  hasCustomText: true,
  defaultText: "",
  textPlaceholder: "Location name",
  render,
};
