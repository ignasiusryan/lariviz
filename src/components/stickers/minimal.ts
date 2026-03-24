import type { StickerTemplate, StickerConfig } from "./types";
import { getColors } from "./shared";

const S = 2;
const W = 440 * S;
const H = 160 * S;

function render(ctx: CanvasRenderingContext2D, config: StickerConfig) {
  const c = getColors(config.theme);

  if (config.theme === "dark") {
    // Subtle dark pill background
    ctx.fillStyle = c.bg;
    ctx.beginPath();
    ctx.roundRect(0, 0, W, H, 20 * S);
    ctx.fill();
    ctx.strokeStyle = c.border;
    ctx.lineWidth = S;
    ctx.beginPath();
    ctx.roundRect(0, 0, W, H, 20 * S);
    ctx.stroke();
  }

  const cx = W / 2;

  // Main line: [ 7.11 KM ]
  const bracketFont = `300 ${20 * S}px 'JetBrains Mono', monospace`;
  const numFont = `400 ${42 * S}px 'JetBrains Mono', monospace`;
  const unitFont = `400 ${24 * S}px 'JetBrains Mono', monospace`;

  const distText = config.distanceKm;
  const unitText = " KM";
  const bracketL = "[  ";
  const bracketR = "  ]";

  // Measure total width
  ctx.font = bracketFont;
  const blW = ctx.measureText(bracketL).width;
  const brW = ctx.measureText(bracketR).width;
  ctx.font = numFont;
  const numW = ctx.measureText(distText).width;
  ctx.font = unitFont;
  const unitW = ctx.measureText(unitText).width;

  const totalW = blW + numW + unitW + brW;
  let x = cx - totalW / 2;
  const baseline = 80 * S;

  // Draw bracket left
  ctx.font = bracketFont;
  ctx.fillStyle = c.textDim;
  ctx.fillText(bracketL, x, baseline);
  x += blW;

  // Distance number
  ctx.font = numFont;
  ctx.fillStyle = c.text;
  ctx.fillText(distText, x, baseline);
  x += numW;

  // Unit
  ctx.font = unitFont;
  ctx.fillStyle = c.textMuted;
  ctx.fillText(unitText, x, baseline);
  x += unitW;

  // Bracket right
  ctx.font = bracketFont;
  ctx.fillStyle = c.textDim;
  ctx.fillText(bracketR, x, baseline);

  // Sub stats
  const subText = `${config.duration}  |  ${config.pace}/km`;
  ctx.font = `400 ${13 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.textDim;
  const subW = ctx.measureText(subText).width;
  ctx.fillText(subText, cx - subW / 2, 118 * S);
}

export const minimal: StickerTemplate = {
  id: "minimal",
  name: "Minimal",
  width: W,
  height: H,
  hasCustomText: false,
  render,
};
