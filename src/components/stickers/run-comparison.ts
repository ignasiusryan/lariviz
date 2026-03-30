import type { InsightTemplate, InsightConfig } from "./types";
import { getColors, drawTextCentered, drawRoute, drawWatermark } from "./shared";
import { decodePolyline } from "@/lib/polyline";
import { formatPace } from "@/lib/format";

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export const runComparison: InsightTemplate = {
  id: "run-comparison",
  name: "Run Comparison",
  description: "Compare two runs side by side",
  width: 1080,
  height: 1080,
  render(ctx, config) {
    const W = 1080;
    const H = 1080;
    const c = getColors(config.theme);

    // Background
    if (config.theme === "dark") {
      ctx.fillStyle = c.bg;
      ctx.fillRect(0, 0, W, H);
    }

    // Border
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(32, 32, W - 64, H - 64);

    // Find runs with polylines
    const withPolyline = config.activities.filter(
      (a) => a.map?.summary_polyline && a.map.summary_polyline.length > 0
    );

    let runA = withPolyline[0] ?? null;
    let runB = config.selectedRunB ?? null;

    // If Run B is missing, pick two most recent with polylines
    if (!runB && withPolyline.length >= 2) {
      runA = withPolyline[0];
      runB = withPolyline[1];
    }

    // Not enough runs
    if (!runA || !runB) {
      drawTextCentered(
        ctx,
        "Select two runs to compare",
        W / 2,
        H / 2,
        "600 24px 'Plus Jakarta Sans', sans-serif",
        c.textMuted
      );
      return;
    }

    // Header
    drawTextCentered(
      ctx,
      "RUN COMPARISON",
      W / 2,
      80,
      "500 14px 'JetBrains Mono', monospace",
      c.accent
    );

    // Decode polylines
    const pointsA = decodePolyline(runA.map!.summary_polyline!);
    const pointsB = decodePolyline(runB.map!.summary_polyline!);

    // Draw routes side by side
    const routeSize = 380;
    const routeAX = W / 2 - routeSize - 20;
    const routeBX = W / 2 + 20;
    const routeY = 110;

    drawRoute(ctx, pointsA, routeAX, routeY, routeSize, "#ff8c00", 3);
    drawRoute(ctx, pointsB, routeBX, routeY, routeSize, "#2dd4bf", 3);

    // Divider
    ctx.beginPath();
    ctx.moveTo(60, 520);
    ctx.lineTo(W - 60, 520);
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Run names
    drawTextCentered(
      ctx,
      runA.name || "Run A",
      W / 4,
      560,
      "600 22px 'Plus Jakarta Sans', sans-serif",
      "#ff8c00"
    );
    drawTextCentered(
      ctx,
      runB.name || "Run B",
      (3 * W) / 4,
      560,
      "600 22px 'Plus Jakarta Sans', sans-serif",
      "#2dd4bf"
    );

    // Dates
    drawTextCentered(
      ctx,
      formatDate(runA.start_date_local),
      W / 4,
      588,
      "400 14px 'JetBrains Mono', monospace",
      c.textMuted
    );
    drawTextCentered(
      ctx,
      formatDate(runB.start_date_local),
      (3 * W) / 4,
      588,
      "400 14px 'JetBrains Mono', monospace",
      c.textMuted
    );

    // Stats
    const distA = runA.distance / 1000;
    const distB = runB.distance / 1000;
    const paceA = runA.moving_time / 60 / distA;
    const paceB = runB.moving_time / 60 / distB;
    const timeA = runA.moving_time;
    const timeB = runB.moving_time;
    const elevA = runA.total_elevation_gain ?? 0;
    const elevB = runB.total_elevation_gain ?? 0;

    const rows = [
      { label: "DISTANCE", valA: `${distA.toFixed(1)} km`, valB: `${distB.toFixed(1)} km`, delta: null as string | null },
      { label: "PACE", valA: formatPace(paceA), valB: formatPace(paceB), delta: paceB < paceA ? "up" : paceB > paceA ? "down" : null },
      { label: "TIME", valA: formatTime(timeA), valB: formatTime(timeB), delta: null },
      { label: "ELEVATION", valA: `${Math.round(elevA)}m`, valB: `${Math.round(elevB)}m`, delta: null },
    ];

    const startY = 640;
    const rowSpacing = 50;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const y = startY + i * rowSpacing;

      // Label
      ctx.font = "500 12px 'JetBrains Mono', monospace";
      ctx.fillStyle = c.textDim;
      ctx.fillText(row.label, 80, y);

      // Run A value (right-aligned at x=340)
      ctx.font = "600 24px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = c.text;
      const valAWidth = ctx.measureText(row.valA).width;
      ctx.fillText(row.valA, 340 - valAWidth, y);

      // Arrow
      drawTextCentered(
        ctx,
        "\u2192",
        W / 2,
        y,
        "500 18px 'JetBrains Mono', monospace",
        c.textDim
      );

      // Run B value (left-aligned at x=740)
      ctx.font = "600 24px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = c.text;
      ctx.fillText(row.valB, 740, y);

      // Delta indicator (pace only)
      if (row.delta) {
        const valBWidth = ctx.measureText(row.valB).width;
        ctx.font = "600 18px 'Plus Jakarta Sans', sans-serif";
        if (row.delta === "up") {
          ctx.fillStyle = "#4ADE80";
          ctx.fillText("\u2191", 740 + valBWidth + 8, y);
        } else {
          ctx.fillStyle = "#f87171";
          ctx.fillText("\u2193", 740 + valBWidth + 8, y);
        }
      }
    }

    // Athlete name bottom-left
    ctx.font = "600 14px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = c.textMuted;
    ctx.fillText(config.athleteName.toUpperCase(), 48, H - 48);

    // Watermark bottom-right
    ctx.font = "600 14px 'JetBrains Mono', monospace";
    const wmWidth = ctx.measureText("LARIVIZ").width;
    drawWatermark(ctx, W - 48 - wmWidth, H - 48, c.textDim, 14);
  },
};
