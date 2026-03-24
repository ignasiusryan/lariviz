import type { StickerTemplate, StickerConfig } from "./types";
import { getColors, fillRoundedRect, strokeRoundedRect, drawRouteGlow, drawTextCentered, drawWatermark } from "./shared";

const S = 2;
const W = 480 * S;
const H = 540 * S;

function render(ctx: CanvasRenderingContext2D, config: StickerConfig) {
  const c = getColors(config.theme);

  if (config.theme === "dark") {
    fillRoundedRect(ctx, 0, 0, W, H, 24 * S, c.bg);
    strokeRoundedRect(ctx, 0, 0, W, H, 24 * S, c.border, S);
  }

  const cx = W / 2;
  const routeSize = 320 * S;
  const routeX = (W - routeSize) / 2;
  const routeY = 30 * S;

  // Route drawing with glow
  if (config.routePoints.length > 1) {
    drawRouteGlow(ctx, config.routePoints, routeX, routeY, routeSize, c.accent, 4 * S);
  } else {
    // No route - show placeholder
    drawTextCentered(ctx, "No route data", cx, routeY + routeSize / 2, `400 ${16 * S}px 'JetBrains Mono', monospace`, c.textDim);
  }

  // Divider
  const divY = routeY + routeSize + 20 * S;
  ctx.strokeStyle = c.border;
  ctx.lineWidth = S;
  ctx.beginPath();
  ctx.moveTo(40 * S, divY);
  ctx.lineTo(W - 40 * S, divY);
  ctx.stroke();

  // Stats row below route
  const statsY = divY + 50 * S;
  const stats = [
    { label: "DISTANCE", value: config.distanceKm, unit: "km" },
    { label: "PACE", value: config.pace, unit: "/km" },
    { label: "TIME", value: config.duration, unit: "" },
  ];

  const colW = (W - 80 * S) / 3;
  for (let i = 0; i < stats.length; i++) {
    const sx = 40 * S + colW * i + colW / 2;

    ctx.font = `600 ${10 * S}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = c.textDim;
    ctx.letterSpacing = `${2 * S}px`;
    const lw = ctx.measureText(stats[i].label).width;
    ctx.fillText(stats[i].label, sx - lw / 2, statsY);
    ctx.letterSpacing = "0px";

    // Value
    ctx.font = `700 ${28 * S}px Outfit, sans-serif`;
    ctx.fillStyle = c.text;
    const fullVal = stats[i].unit ? stats[i].value + stats[i].unit : stats[i].value;
    const vw = ctx.measureText(fullVal).width;
    ctx.fillText(fullVal, sx - vw / 2, statsY + 35 * S);
  }

  // Watermark
  drawWatermark(ctx, 40 * S, H - 24 * S, c.textDim, 10 * S);
}

export const routeMap: StickerTemplate = {
  id: "route-map",
  name: "Route Map",
  width: W,
  height: H,
  hasCustomText: false,
  render,
};
