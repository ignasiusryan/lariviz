import type { StickerTemplate, StickerConfig } from "./types";
import { getColors, fillRoundedRect, strokeRoundedRect } from "./shared";

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
  const radius = 160 * S;

  // Outer circle
  ctx.strokeStyle = c.textDim;
  ctx.lineWidth = 2 * S;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Inner circle (slightly smaller, dashed)
  ctx.setLineDash([4 * S, 4 * S]);
  ctx.strokeStyle = c.border;
  ctx.lineWidth = S;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 12 * S, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Text along circle path
  const items = [
    `${config.distanceKm} KM`,
    `${config.pace} PACE`,
    config.duration,
  ];
  const fullText = items.join("  ·  ");

  ctx.font = `600 ${14 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.text;

  // Measure total width to calculate angular span
  const charWidths: number[] = [];
  for (const ch of fullText) {
    charWidths.push(ctx.measureText(ch).width);
  }
  const totalWidth = charWidths.reduce((a, b) => a + b, 0);
  const textRadius = radius - 30 * S;
  const totalAngle = totalWidth / textRadius;

  // Start from top, going clockwise
  let angle = -Math.PI / 2 - totalAngle / 2;

  ctx.save();
  for (let i = 0; i < fullText.length; i++) {
    const ch = fullText[i];
    const halfChar = charWidths[i] / 2;
    angle += halfChar / textRadius;

    ctx.save();
    ctx.translate(
      cx + textRadius * Math.cos(angle),
      cy + textRadius * Math.sin(angle)
    );
    ctx.rotate(angle + Math.PI / 2);

    // Highlight dots in accent color
    if (ch === "·") {
      ctx.fillStyle = c.accent;
    } else {
      ctx.fillStyle = c.text;
    }
    ctx.fillText(ch, -halfChar, 0);
    ctx.restore();

    angle += halfChar / textRadius;
  }
  ctx.restore();

  // Center: small sun/run icon
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 2 * S;
  const iconR = 8 * S;
  ctx.beginPath();
  ctx.arc(cx, cy - 20 * S, iconR, 0, Math.PI * 2);
  ctx.stroke();

  // Sun rays
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8;
    const inner = iconR + 4 * S;
    const outer = iconR + 10 * S;
    ctx.beginPath();
    ctx.moveTo(cx + inner * Math.cos(a), cy - 20 * S + inner * Math.sin(a));
    ctx.lineTo(cx + outer * Math.cos(a), cy - 20 * S + outer * Math.sin(a));
    ctx.stroke();
  }

  // Date below icon
  ctx.font = `400 ${12 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.textMuted;
  const dateStr = config.date;
  const dateW = ctx.measureText(dateStr).width;
  ctx.fillText(dateStr, cx - dateW / 2, cy + 25 * S);

  // Watermark at bottom
  ctx.font = `600 ${9 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.textDim;
  const wmW = ctx.measureText("LARIVIZ").width;
  ctx.fillText("LARIVIZ", cx - wmW / 2, H - 22 * S);
}

export const circularStamp: StickerTemplate = {
  id: "circular-stamp",
  name: "Circular Stamp",
  width: W,
  height: H,
  hasCustomText: false,
  render,
};
