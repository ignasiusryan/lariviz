import type { StickerTemplate, StickerConfig } from "./types";
import { getColors, fillRoundedRect, strokeRoundedRect, drawWatermark } from "./shared";

// "Typewriter" — typed text with highlighted stats
const S = 2;
const W = 540 * S;
const H = 540 * S;

function render(ctx: CanvasRenderingContext2D, config: StickerConfig) {
  const c = getColors(config.theme);

  if (config.theme === "dark") {
    fillRoundedRect(ctx, 0, 0, W, H, 28 * S, c.bg);
    strokeRoundedRect(ctx, 0, 0, W, H, 28 * S, c.border, S);
  }

  const pad = 55 * S;
  const cx = W / 2;

  // Quotation mark — decorative
  ctx.font = `700 ${100 * S}px 'Playfair Display', Georgia, serif`;
  ctx.fillStyle = c.accentDim;
  ctx.fillText("\u201C", pad - 10 * S, 130 * S);

  // Build sentence
  const defaultSentence = `laced up and chased\n{distance} km through\n{location}`;
  const rawText = config.customText || defaultSentence;
  const text = rawText
    .replace(/\{distance\}/g, config.distanceKm)
    .replace(/\{pace\}/g, config.pace)
    .replace(/\{time\}/g, config.duration)
    .replace(/\{location\}/g, config.location || "the streets");

  const lines = text.split("\n");
  const lineHeight = 52 * S;
  const startY = 200 * S;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const y = startY + i * lineHeight;

    // Split into number parts and text parts
    const parts = line.split(/(\d+[\.:]\d+|\d+)/);
    let x = pad;

    for (const part of parts) {
      if (/^\d/.test(part)) {
        // Numbers — bold accent with underline
        ctx.font = `800 ${36 * S}px Outfit, sans-serif`;
        ctx.fillStyle = c.accent;
        const pw = ctx.measureText(part).width;
        ctx.fillText(part, x, y);

        // Underline
        ctx.fillRect(x, y + 6 * S, pw, 2.5 * S);

        x += pw;
      } else if (part.length > 0) {
        // Text — serif
        ctx.font = `italic 400 ${30 * S}px 'Playfair Display', Georgia, serif`;
        ctx.fillStyle = c.text;
        ctx.fillText(part, x, y);
        x += ctx.measureText(part).width;
      }
    }
  }

  // Closing quotation mark
  ctx.font = `700 ${100 * S}px 'Playfair Display', Georgia, serif`;
  ctx.fillStyle = c.accentDim;
  const closeY = startY + lines.length * lineHeight + 20 * S;
  const closeW = ctx.measureText("\u201D").width;
  ctx.fillText("\u201D", W - pad - closeW, Math.min(closeY, 420 * S));

  // Footer stats
  ctx.font = `400 ${12 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.textDim;
  const footer = `${config.pace} /km  ·  ${config.duration}  ·  ${config.date}`;
  const fw = ctx.measureText(footer).width;
  ctx.fillText(footer, cx - fw / 2, H - 60 * S);

  drawWatermark(ctx, pad, H - 28 * S, c.textDim, 9 * S);
}

export const poetic: StickerTemplate = {
  id: "poetic",
  name: "Typewriter",
  width: W,
  height: H,
  hasCustomText: true,
  defaultText: "",
  textPlaceholder: "Your caption...",
  render,
};
