import type { InsightTemplate, InsightConfig } from "./types";
import { getColors, drawRouteGlow, drawTextCentered, drawWatermark } from "./shared";
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
    const routeSize = 520;
    const routeX = (W - routeSize) / 2;
    const routeY = 60;
    drawRouteGlow(ctx, points, routeX, routeY, routeSize, c.accent, 4);

    // Run name as headline
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
    ctx.fillText(name, (W - nameW) / 2, 640);
    ctx.letterSpacing = "0px";

    // Accent line
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 50, 660);
    ctx.lineTo(W / 2 + 50, 660);
    ctx.stroke();

    // Date + location + athlete name
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
      const scale = (W - 100) / metaW;
      ctx.font = `500 ${Math.floor(18 * scale)}px 'Plus Jakarta Sans', sans-serif`;
    }
    drawTextCentered(ctx, metaLine, W / 2, 696, ctx.font, c.textMuted);
    ctx.letterSpacing = "0px";

    // Stats row
    const distKm = run.distance / 1000;
    const paceMin = distKm > 0 ? run.moving_time / 60 / distKm : 0;
    const elev = run.total_elevation_gain || 0;

    const stats = [
      { label: "DISTANCE", value: `${formatNumber(distKm, 2)} km` },
      { label: "TIME", value: formatTime(run.moving_time) },
      { label: "PACE", value: paceMin > 0 ? `${formatPace(paceMin)} /km` : "—" },
      { label: "ELEVATION", value: `${Math.round(elev)} m` },
    ];

    const statsY = 810;
    const statColW = (W - 120) / stats.length;
    for (let i = 0; i < stats.length; i++) {
      const sx = 60 + statColW * i + statColW / 2;

      ctx.font = "600 42px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = c.text;
      const vw = ctx.measureText(stats[i].value).width;
      ctx.fillText(stats[i].value, sx - vw / 2, statsY);

      ctx.font = "400 14px 'JetBrains Mono', Menlo, monospace";
      ctx.fillStyle = c.textMuted;
      ctx.letterSpacing = "3px";
      const lw = ctx.measureText(stats[i].label).width;
      ctx.fillText(stats[i].label, sx - lw / 2, statsY + 28);
      ctx.letterSpacing = "0px";
    }

    // Divider above stats
    ctx.fillStyle = c.border;
    ctx.fillRect(60, 750, W - 120, 1);

    // Divider below stats
    ctx.fillStyle = c.border;
    ctx.fillRect(60, 870, W - 120, 1);

    // Footer
    ctx.font = "400 14px 'JetBrains Mono', Menlo, monospace";
    ctx.fillStyle = c.textDim;
    ctx.globalAlpha = 0.5;
    ctx.fillText("lariviz.xyz", inset + 16, H - inset - 12);
    ctx.globalAlpha = 1;

    drawWatermark(ctx, W - inset - 100, H - inset - 12, c.textDim, 12);
  },
};
