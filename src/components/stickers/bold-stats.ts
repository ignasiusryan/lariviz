import type { StickerTemplate, StickerConfig } from "./types";
import { getColors, fillRoundedRect, strokeRoundedRect, drawWatermark } from "./shared";

// "Ticker" — receipt / ticket stub aesthetic
const S = 2;
const W = 540 * S;
const H = 540 * S;

function render(ctx: CanvasRenderingContext2D, config: StickerConfig) {
  const c = getColors(config.theme);

  if (config.theme === "dark") {
    fillRoundedRect(ctx, 0, 0, W, H, 28 * S, c.bg);
    strokeRoundedRect(ctx, 0, 0, W, H, 28 * S, c.border, S);
  }

  const pad = 50 * S;
  const cx = W / 2;

  // Dotted border inset
  ctx.setLineDash([6 * S, 6 * S]);
  ctx.strokeStyle = c.textDim;
  ctx.lineWidth = S;
  ctx.beginPath();
  ctx.roundRect(pad - 10 * S, pad - 10 * S, W - pad * 2 + 20 * S, H - pad * 2 + 20 * S, 14 * S);
  ctx.stroke();
  ctx.setLineDash([]);

  // "LARIVIZ RUN RECEIPT" header
  ctx.font = `600 ${12 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.accent;
  const headerText = "RUN RECEIPT";
  const hw = ctx.measureText(headerText).width;
  ctx.fillText(headerText, cx - hw / 2, pad + 30 * S);

  // Dotted divider
  ctx.setLineDash([4 * S, 4 * S]);
  ctx.strokeStyle = c.textDim;
  ctx.beginPath();
  ctx.moveTo(pad + 10 * S, pad + 50 * S);
  ctx.lineTo(W - pad - 10 * S, pad + 50 * S);
  ctx.stroke();
  ctx.setLineDash([]);

  // Three main stats — large monospace
  const items = [
    { label: "DISTANCE", value: config.distanceKm, unit: "km" },
    { label: "PACE", value: config.pace, unit: "/km" },
    { label: "DURATION", value: config.duration, unit: "" },
  ];

  const lineH = 100 * S;
  let y = pad + 80 * S;

  for (const item of items) {
    // Label — left aligned
    ctx.font = `400 ${11 * S}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = c.textDim;
    ctx.fillText(item.label, pad + 16 * S, y);

    // Value — right aligned, large
    const valStr = item.unit ? `${item.value} ${item.unit}` : item.value;
    ctx.font = `700 ${36 * S}px Outfit, sans-serif`;
    ctx.fillStyle = c.text;
    const vw = ctx.measureText(valStr).width;
    ctx.fillText(valStr, W - pad - 16 * S - vw, y + 6 * S);

    // Dotted separator
    y += 20 * S;
    ctx.setLineDash([3 * S, 5 * S]);
    ctx.strokeStyle = c.border;
    ctx.beginPath();
    ctx.moveTo(pad + 10 * S, y);
    ctx.lineTo(W - pad - 10 * S, y);
    ctx.stroke();
    ctx.setLineDash([]);

    y += lineH - 20 * S;
  }

  // Date + location footer
  const footer = `${config.dayOfWeek} ${config.date}${config.location ? "  ·  " + config.location : ""}`;
  ctx.font = `400 ${12 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.textMuted;
  const fw = ctx.measureText(footer).width;
  ctx.fillText(footer, cx - fw / 2, H - pad - 20 * S);

  drawWatermark(ctx, pad, H - pad + 6 * S, c.textDim, 9 * S);
}

export const boldStats: StickerTemplate = {
  id: "bold-stats",
  name: "Receipt",
  width: W,
  height: H,
  hasCustomText: false,
  render,
};
