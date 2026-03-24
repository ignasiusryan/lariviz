import type { StickerTemplate, StickerConfig } from "./types";
import { getColors, fillRoundedRect, strokeRoundedRect, drawTextCentered, drawWatermark } from "./shared";

const S = 2;
const W = 540 * S;
const H = 200 * S;

function render(ctx: CanvasRenderingContext2D, config: StickerConfig) {
  const c = getColors(config.theme);

  if (config.theme === "dark") {
    fillRoundedRect(ctx, 0, 0, W, H, 24 * S, c.bg);
    strokeRoundedRect(ctx, 0, 0, W, H, 24 * S, c.border, S);
  }

  const cols = 3;
  const colW = W / cols;
  const values = [config.duration, config.distanceKm, config.pace];
  const units = ["MIN", "KM", "/KM"];

  for (let i = 0; i < cols; i++) {
    const cx = colW * i + colW / 2;

    // Value — big bold Bebas Neue
    ctx.font = `400 ${56 * S}px 'Bebas Neue', Impact, sans-serif`;
    ctx.fillStyle = c.text;
    const valW = ctx.measureText(values[i]).width;
    ctx.fillText(values[i], cx - valW / 2, 105 * S);

    // Unit label
    ctx.font = `600 ${14 * S}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = c.textDim;
    ctx.letterSpacing = `${2 * S}px`;
    const unitW = ctx.measureText(units[i]).width;
    ctx.fillText(units[i], cx - unitW / 2, 135 * S);
    ctx.letterSpacing = "0px";

    // Divider between columns
    if (i < cols - 1) {
      ctx.strokeStyle = c.border;
      ctx.lineWidth = S;
      ctx.beginPath();
      ctx.moveTo(colW * (i + 1), 50 * S);
      ctx.lineTo(colW * (i + 1), 150 * S);
      ctx.stroke();
    }
  }

  // Watermark bottom-right
  ctx.font = `600 ${10 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.textDim;
  const wmW = ctx.measureText("LARIVIZ").width;
  ctx.fillText("LARIVIZ", W - 30 * S - wmW, H - 20 * S);
}

export const boldStats: StickerTemplate = {
  id: "bold-stats",
  name: "Bold Stats",
  width: W,
  height: H,
  hasCustomText: false,
  render,
};
