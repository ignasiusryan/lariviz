import type { StickerTemplate, StickerConfig } from "./types";
import { getColors, fillRoundedRect, strokeRoundedRect, drawWatermark } from "./shared";

// "Orbit" — concentric rings with stats at orbital positions
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
  const cy = H / 2;

  // Outer ring — thin dashed
  ctx.setLineDash([8 * S, 6 * S]);
  ctx.strokeStyle = c.border;
  ctx.lineWidth = 1.5 * S;
  ctx.beginPath();
  ctx.arc(cx, cy, 220 * S, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Middle ring — solid accent, partial arc
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 3 * S;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, 170 * S, -Math.PI * 0.6, Math.PI * 0.9);
  ctx.stroke();

  // Inner ring — thin
  ctx.strokeStyle = c.textDim;
  ctx.lineWidth = S;
  ctx.beginPath();
  ctx.arc(cx, cy, 120 * S, 0, Math.PI * 2);
  ctx.stroke();

  // Center — big distance
  ctx.font = `800 ${72 * S}px Outfit, sans-serif`;
  ctx.fillStyle = c.text;
  const distW = ctx.measureText(config.distanceKm).width;
  ctx.fillText(config.distanceKm, cx - distW / 2, cy + 10 * S);

  // "km" below
  ctx.font = `300 ${22 * S}px Outfit, sans-serif`;
  ctx.fillStyle = c.textMuted;
  const kmW = ctx.measureText("km").width;
  ctx.fillText("km", cx - kmW / 2, cy + 40 * S);

  // Stats placed at orbital positions on the middle ring
  const orbitR = 170 * S;
  const orbitItems = [
    { label: "PACE", value: config.pace, angle: -Math.PI * 0.55 },
    { label: "TIME", value: config.duration, angle: Math.PI * 0.05 },
    { label: "DATE", value: config.date, angle: Math.PI * 0.6 },
  ];

  for (const item of orbitItems) {
    const ox = cx + orbitR * Math.cos(item.angle);
    const oy = cy + orbitR * Math.sin(item.angle);

    // Background pill
    ctx.font = `600 ${16 * S}px Outfit, sans-serif`;
    const valW = ctx.measureText(item.value).width;
    const pillW = valW + 24 * S;
    const pillH = 32 * S;

    fillRoundedRect(ctx, ox - pillW / 2, oy - pillH / 2, pillW, pillH, pillH / 2,
      config.theme === "dark" ? c.bg : "rgba(0,0,0,0.5)");

    ctx.strokeStyle = c.border;
    ctx.lineWidth = S;
    ctx.beginPath();
    ctx.roundRect(ox - pillW / 2, oy - pillH / 2, pillW, pillH, pillH / 2);
    ctx.stroke();

    ctx.fillStyle = c.text;
    ctx.fillText(item.value, ox - valW / 2, oy + 6 * S);
  }

  // Small accent dot at start of accent arc
  const dotAngle = -Math.PI * 0.6;
  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.arc(cx + orbitR * Math.cos(dotAngle), cy + orbitR * Math.sin(dotAngle), 5 * S, 0, Math.PI * 2);
  ctx.fill();

  // Accent dot at end
  const dotAngle2 = Math.PI * 0.9;
  ctx.beginPath();
  ctx.arc(cx + orbitR * Math.cos(dotAngle2), cy + orbitR * Math.sin(dotAngle2), 5 * S, 0, Math.PI * 2);
  ctx.fill();

  drawWatermark(ctx, 40 * S, H - 24 * S, c.textDim, 9 * S);
}

export const circularStamp: StickerTemplate = {
  id: "circular-stamp",
  name: "Orbit",
  width: W,
  height: H,
  hasCustomText: false,
  render,
};
