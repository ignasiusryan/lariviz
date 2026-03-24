import type { StickerTemplate, StickerConfig } from "./types";
import { getColors, fillRoundedRect, strokeRoundedRect, drawWatermark } from "./shared";

// "Trail" — route as brushstroke art, gradient glow, minimal stats
const S = 2;
const W = 540 * S;
const H = 540 * S;

function drawGradientRoute(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  x: number,
  y: number,
  size: number,
  startColor: string,
  endColor: string
) {
  if (points.length < 2) return;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [lat, lng] of points) {
    if (lng < minX) minX = lng;
    if (lng > maxX) maxX = lng;
    if (lat < minY) minY = lat;
    if (lat > maxY) maxY = lat;
  }

  const dX = maxX - minX || 0.001;
  const dY = maxY - minY || 0.001;
  const pad = size * 0.1;
  const effectiveSize = size - pad * 2;
  const scale = effectiveSize / Math.max(dX, dY);
  const offsetX = (effectiveSize - dX * scale) / 2 + pad + x;
  const offsetY = (effectiveSize - dY * scale) / 2 + pad + y;

  const mapped = points.map(([lat, lng]) => [
    (lng - minX) * scale + offsetX,
    (maxY - lat) * scale + offsetY,
  ]);

  // Glow layer
  ctx.save();
  ctx.shadowColor = startColor;
  ctx.shadowBlur = 30 * S;
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = startColor;
  ctx.lineWidth = 6 * S;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  mapped.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py));
  ctx.stroke();
  ctx.restore();

  // Gradient stroke — draw in segments
  const segmentCount = mapped.length - 1;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 3.5 * S;

  for (let i = 0; i < segmentCount; i++) {
    const t = i / segmentCount;
    // Interpolate orange → warm red
    const r = Math.round(255 * (1 - t * 0.2));
    const g = Math.round(140 * (1 - t * 0.6));
    const b = Math.round(t * 60);
    ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.beginPath();
    ctx.moveTo(mapped[i][0], mapped[i][1]);
    ctx.lineTo(mapped[i + 1][0], mapped[i + 1][1]);
    ctx.stroke();
  }

  // Start dot
  ctx.fillStyle = startColor;
  ctx.beginPath();
  ctx.arc(mapped[0][0], mapped[0][1], 5 * S, 0, Math.PI * 2);
  ctx.fill();

  // End dot
  ctx.fillStyle = endColor;
  ctx.beginPath();
  ctx.arc(mapped[mapped.length - 1][0], mapped[mapped.length - 1][1], 5 * S, 0, Math.PI * 2);
  ctx.fill();
}

function render(ctx: CanvasRenderingContext2D, config: StickerConfig) {
  const c = getColors(config.theme);

  if (config.theme === "dark") {
    fillRoundedRect(ctx, 0, 0, W, H, 28 * S, c.bg);
    strokeRoundedRect(ctx, 0, 0, W, H, 28 * S, c.border, S);
  }

  const cx = W / 2;

  // Route takes most of the space
  if (config.routePoints.length > 1) {
    drawGradientRoute(ctx, config.routePoints, 20 * S, 20 * S, 400 * S, c.accent, "#ff5533");
  } else {
    ctx.font = `400 ${16 * S}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = c.textDim;
    const nrW = ctx.measureText("No route data").width;
    ctx.fillText("No route data", cx - nrW / 2, 220 * S);
  }

  // Stats bar at bottom
  const barY = 430 * S;
  fillRoundedRect(ctx, 30 * S, barY, W - 60 * S, 76 * S, 14 * S, config.theme === "dark" ? "rgba(255,140,0,0.08)" : "rgba(255,140,0,0.15)");

  const stats = [
    { val: `${config.distanceKm}km`, label: "DIST" },
    { val: config.pace, label: "PACE" },
    { val: config.duration, label: "TIME" },
  ];

  const barW = W - 60 * S;
  const colW = barW / 3;

  for (let i = 0; i < stats.length; i++) {
    const sx = 30 * S + colW * i + colW / 2;

    ctx.font = `700 ${24 * S}px Outfit, sans-serif`;
    ctx.fillStyle = c.text;
    const vw = ctx.measureText(stats[i].val).width;
    ctx.fillText(stats[i].val, sx - vw / 2, barY + 35 * S);

    ctx.font = `400 ${10 * S}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = c.textDim;
    const lw = ctx.measureText(stats[i].label).width;
    ctx.fillText(stats[i].label, sx - lw / 2, barY + 55 * S);
  }

  drawWatermark(ctx, 40 * S, H - 20 * S, c.textDim, 9 * S);
}

export const routeMap: StickerTemplate = {
  id: "route-map",
  name: "Trail",
  width: W,
  height: H,
  hasCustomText: false,
  render,
};
