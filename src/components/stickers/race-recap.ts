import type { InsightTemplate, InsightConfig } from "./types";
import { getColors, drawRouteGlow, drawTextCentered, drawWatermark, fillRoundedRect } from "./shared";
import { decodePolyline } from "@/lib/polyline";
import { formatPace, formatNumber } from "@/lib/format";

const W = 1080, H = 1080;

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getLocation(a: { location_city?: string | null; location_state?: string | null; resolved_city?: string | null; resolved_country?: string | null; location_country?: string | null; timezone?: string }): string {
  const parts: string[] = [];
  if (a.resolved_city) parts.push(a.resolved_city);
  else if (a.location_city) parts.push(a.location_city);
  else if (a.location_state) parts.push(a.location_state);
  if (a.resolved_country) parts.push(a.resolved_country);
  else if (a.location_country) parts.push(a.location_country);
  if (parts.length > 0) return parts.join(", ");
  if (a.timezone) {
    const match = a.timezone.match(/\/([^/]+)$/);
    if (match) return match[1].replace(/_/g, " ");
  }
  return "";
}

export const raceRecap: InsightTemplate = {
  id: "race-recap",
  name: "Race Recap",
  description: "Single-run celebration card with route and stats",
  width: W,
  height: H,
  render(ctx: CanvasRenderingContext2D, config: InsightConfig) {
    const c = getColors(config.theme);

    // Pick the most recent qualifying run (10km+) with a polyline
    const qualifying = config.activities
      .filter((a) => a.distance >= 10000 && a.map?.summary_polyline)
      .sort((a, b) => new Date(b.start_date_local).getTime() - new Date(a.start_date_local).getTime());

    const run = qualifying[0];

    // Background
    if (config.theme === "dark") {
      ctx.fillStyle = c.bg;
      ctx.fillRect(0, 0, W, H);
    }

    // Border
    const inset = 32;
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2);

    if (!run) {
      drawTextCentered(ctx, "No qualifying runs found (10km+ with GPS)", W / 2, H / 2, "400 24px 'Plus Jakarta Sans', sans-serif", c.textMuted);
      return;
    }

    // Decode route
    const points = decodePolyline(run.map!.summary_polyline!);

    // Hero route with glow
    const routeSize = 440;
    const routeX = (W - routeSize) / 2;
    const routeY = 80;
    drawRouteGlow(ctx, points, routeX, routeY, routeSize, c.accent, 4);

    // Run name as headline
    const nameY = routeY + routeSize + 40;
    const name = run.name.toUpperCase();
    ctx.font = "700 48px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = c.text;
    ctx.letterSpacing = "8px";
    let nameW = ctx.measureText(name).width;
    if (nameW > W - 120) {
      const scale = (W - 120) / nameW;
      ctx.font = `700 ${Math.floor(48 * scale)}px 'Plus Jakarta Sans', sans-serif`;
    }
    nameW = ctx.measureText(name).width;
    ctx.fillText(name, (W - nameW) / 2, nameY);
    ctx.letterSpacing = "0px";

    // Accent line
    const accentLineY = nameY + 20;
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 50, accentLineY);
    ctx.lineTo(W / 2 + 50, accentLineY);
    ctx.stroke();

    // Date + location + athlete name
    const metaLineY = nameY + 56;
    const date = new Date(run.start_date_local).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase();
    const location = getLocation(run);
    const metaParts = [date];
    if (location) metaParts.push(location.toUpperCase());
    if (config.athleteName) metaParts.push(config.athleteName.toUpperCase());
    const metaLine = metaParts.join("  ·  ");

    ctx.font = "500 18px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = c.textMuted;
    ctx.letterSpacing = "3px";
    const metaW = ctx.measureText(metaLine).width;
    if (metaW > W - 100) {
      // Split into two lines: "DATE · LOCATION" on line 1, "ATHLETE" on line 2
      const dateLoc = [date];
      if (location) dateLoc.push(location.toUpperCase());
      const line1 = dateLoc.join("  ·  ");
      ctx.font = "500 18px 'Plus Jakarta Sans', sans-serif";
      drawTextCentered(ctx, line1, W / 2, metaLineY, ctx.font, c.textMuted);
      if (config.athleteName) {
        drawTextCentered(ctx, config.athleteName.toUpperCase(), W / 2, metaLineY + 24, ctx.font, c.textMuted);
      }
    } else {
      drawTextCentered(ctx, metaLine, W / 2, metaLineY, ctx.font, c.textMuted);
    }
    ctx.letterSpacing = "0px";

    // Stats as 2x2 card grid
    const distKm = run.distance / 1000;
    const paceMin = distKm > 0 ? run.moving_time / 60 / distKm : 0;
    const elev = run.total_elevation_gain || 0;

    const stats = [
      { label: "DISTANCE", value: `${formatNumber(distKm, 2)} km` },
      { label: "TIME", value: formatTime(run.moving_time) },
      { label: "PACE", value: paceMin > 0 ? `${formatPace(paceMin)} /km` : "—" },
      { label: "ELEVATION", value: `${Math.round(elev)} m` },
    ];

    const gridGap = 16;
    const gridPadX = 60;
    const cardW = (W - gridPadX * 2 - gridGap) / 2;
    const cardH = 80;
    const gridTop = metaLineY + 40;
    const cardFill = config.theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.08)";

    // Divider above stats
    ctx.fillStyle = c.border;
    ctx.fillRect(gridPadX, gridTop - 16, W - gridPadX * 2, 1);

    for (let i = 0; i < stats.length; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = gridPadX + col * (cardW + gridGap);
      const cy = gridTop + row * (cardH + gridGap);

      fillRoundedRect(ctx, cx, cy, cardW, cardH, 12, cardFill);

      // Value centered in card
      ctx.font = "600 42px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = c.text;
      const vw = ctx.measureText(stats[i].value).width;
      ctx.fillText(stats[i].value, cx + (cardW - vw) / 2, cy + 42);

      // Label below value
      ctx.font = "400 14px 'JetBrains Mono', Menlo, monospace";
      ctx.fillStyle = c.textMuted;
      ctx.letterSpacing = "3px";
      const lw = ctx.measureText(stats[i].label).width;
      ctx.fillText(stats[i].label, cx + (cardW - lw) / 2, cy + 64);
      ctx.letterSpacing = "0px";
    }

    // Divider below stats
    const gridBottom = gridTop + 2 * cardH + gridGap + 16;
    ctx.fillStyle = c.border;
    ctx.fillRect(gridPadX, gridBottom, W - gridPadX * 2, 1);

    // Footer
    ctx.font = "400 14px 'JetBrains Mono', Menlo, monospace";
    ctx.fillStyle = c.textDim;
    ctx.globalAlpha = 0.5;
    ctx.fillText("lariviz.xyz", inset + 16, H - inset - 12);
    ctx.globalAlpha = 1;

    drawWatermark(ctx, W - inset - 100, H - inset - 12, c.textDim, 12);
  },
};
