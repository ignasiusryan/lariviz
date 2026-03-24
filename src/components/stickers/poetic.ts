import type { StickerTemplate, StickerConfig } from "./types";
import { getColors, fillRoundedRect, strokeRoundedRect } from "./shared";

const S = 2;
const W = 480 * S;
const H = 320 * S;

function render(ctx: CanvasRenderingContext2D, config: StickerConfig) {
  const c = getColors(config.theme);

  if (config.theme === "dark") {
    fillRoundedRect(ctx, 0, 0, W, H, 24 * S, c.bg);
    strokeRoundedRect(ctx, 0, 0, W, H, 24 * S, c.border, S);
  }

  const pad = 44 * S;
  const cx = W / 2;
  const maxTextW = W - pad * 2;

  // Build the sentence
  const defaultSentence = `ran ${config.distanceKm} kilometers\nto clear the mind.`;
  const rawText = config.customText || defaultSentence;

  // Replace {distance}, {pace}, {time}, {location} placeholders
  const text = rawText
    .replace(/\{distance\}/g, config.distanceKm)
    .replace(/\{pace\}/g, config.pace)
    .replace(/\{time\}/g, config.duration)
    .replace(/\{location\}/g, config.location || "the city");

  const lines = text.split("\n");

  // Render each line
  // Mix fonts: "ran" in light Outfit, distance in bold accent Outfit, rest in Playfair italic
  const lineHeight = 50 * S;
  const startY = 70 * S + ((3 - lines.length) * lineHeight) / 2;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const y = startY + i * lineHeight;

    // Check if line contains a number (distance/pace/time value)
    // Highlight numbers in accent color
    const parts = line.split(/(\d+[\.:]\d+|\d+)/);

    let totalW = 0;
    const segments: { text: string; font: string; color: string; width: number }[] = [];

    for (const part of parts) {
      if (/^\d/.test(part)) {
        // Number — bold accent
        const font = `800 ${34 * S}px Outfit, sans-serif`;
        ctx.font = font;
        const w = ctx.measureText(part).width;
        segments.push({ text: part, font, color: c.accent, width: w });
        totalW += w;
      } else if (part.length > 0) {
        // Text — italic serif
        const font = `italic 400 ${30 * S}px 'Playfair Display', Georgia, serif`;
        ctx.font = font;
        const w = ctx.measureText(part).width;
        segments.push({ text: part, font, color: c.text, width: w });
        totalW += w;
      }
    }

    // Draw centered
    let x = cx - totalW / 2;
    for (const seg of segments) {
      ctx.font = seg.font;
      ctx.fillStyle = seg.color;
      ctx.fillText(seg.text, x, y);
      x += seg.width;
    }
  }

  // Subtle bottom info line
  const bottomText = `${config.duration}  ·  avg ${config.pace}`;
  ctx.font = `400 ${12 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.textDim;
  const btW = ctx.measureText(bottomText).width;
  ctx.fillText(bottomText, cx - btW / 2, H - 50 * S);

  // Watermark
  ctx.font = `600 ${9 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.textDim;
  const wmW = ctx.measureText("LARIVIZ").width;
  ctx.fillText("LARIVIZ", cx - wmW / 2, H - 24 * S);
}

export const poetic: StickerTemplate = {
  id: "poetic",
  name: "Poetic",
  width: W,
  height: H,
  hasCustomText: true,
  defaultText: "",
  textPlaceholder: "e.g. ran {distance} km\\nto clear the mind.",
  render,
};
