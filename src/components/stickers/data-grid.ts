import type { StickerTemplate, StickerConfig } from "./types";
import { getColors, fillRoundedRect, strokeRoundedRect } from "./shared";

const S = 2;
const W = 540 * S;
const H = 360 * S;

function render(ctx: CanvasRenderingContext2D, config: StickerConfig) {
  const c = getColors(config.theme);

  if (config.theme === "dark") {
    fillRoundedRect(ctx, 0, 0, W, H, 24 * S, c.bg);
    strokeRoundedRect(ctx, 0, 0, W, H, 24 * S, c.border, S);
  }

  const pad = 36 * S;
  const contentW = W - pad * 2;
  const cols = 3;
  const rows = 2;
  const colW = contentW / cols;
  const rowH = 120 * S;
  const startY = 50 * S;

  const cells = [
    { label: "Dist", value: config.distanceKm, unit: "km" },
    { label: "Pace", value: config.pace, unit: "/km" },
    { label: "Time", value: config.duration, unit: "" },
    { label: "Day", value: config.dayOfWeek, unit: "" },
    { label: "Location", value: config.location || "—", unit: "" },
    { label: "Date", value: config.date, unit: "" },
  ];

  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const i = r * cols + col;
      const cell = cells[i];
      const x = pad + col * colW;
      const y = startY + r * rowH;
      const cellCx = x + colW / 2;

      // Label
      ctx.font = `400 ${13 * S}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = c.textDim;
      const lw = ctx.measureText(cell.label).width;
      ctx.fillText(cell.label, cellCx - lw / 2, y + 20 * S);

      // Value
      ctx.font = `700 ${36 * S}px Outfit, sans-serif`;
      ctx.fillStyle = c.text;
      const vw = ctx.measureText(cell.value).width;
      ctx.fillText(cell.value, cellCx - vw / 2, y + 65 * S);

      // Unit
      if (cell.unit) {
        ctx.font = `400 ${14 * S}px Outfit, sans-serif`;
        ctx.fillStyle = c.textMuted;
        ctx.fillText(cell.unit, cellCx + vw / 2 + 4 * S, y + 65 * S);
      }

      // Vertical dividers
      if (col < cols - 1) {
        ctx.strokeStyle = c.border;
        ctx.lineWidth = S;
        ctx.beginPath();
        ctx.moveTo(x + colW, y + 8 * S);
        ctx.lineTo(x + colW, y + rowH - 16 * S);
        ctx.stroke();
      }
    }

    // Horizontal divider between rows
    if (r < rows - 1) {
      ctx.strokeStyle = c.border;
      ctx.lineWidth = S;
      ctx.beginPath();
      ctx.moveTo(pad + 10 * S, startY + rowH);
      ctx.lineTo(W - pad - 10 * S, startY + rowH);
      ctx.stroke();
    }
  }

  // Watermark bottom-right
  ctx.font = `600 ${9 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.textDim;
  const wmW = ctx.measureText("LARIVIZ").width;
  ctx.fillText("LARIVIZ", W - pad - wmW, H - 18 * S);
}

export const dataGrid: StickerTemplate = {
  id: "data-grid",
  name: "Data Grid",
  width: W,
  height: H,
  hasCustomText: false,
  render,
};
