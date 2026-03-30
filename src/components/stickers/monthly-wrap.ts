import type { InsightTemplate, InsightConfig } from "./types";
import { getColors, drawTextCentered, drawRouteGlow, drawWatermark, fillRoundedRect } from "./shared";
import { decodePolyline } from "@/lib/polyline";
import { formatPace } from "@/lib/format";

const W = 1080, H = 1920;

function getMonthActivities(activities: InsightConfig["activities"], year: number, month: number) {
  return activities.filter((a) => {
    const d = new Date(a.start_date_local);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

function getPrevMonthActivities(activities: InsightConfig["activities"], year: number, month: number) {
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  return getMonthActivities(activities, prevYear, prevMonth);
}

export const monthlyWrap: InsightTemplate = {
  id: "monthly-wrap",
  name: "Monthly Wrap-Up",
  description: "Spotify Wrapped-style monthly running summary",
  width: W,
  height: H,
  render(ctx: CanvasRenderingContext2D, config: InsightConfig) {
    const c = getColors(config.theme);

    // Find the most recent month with data
    const now = new Date();
    let targetYear = now.getFullYear();
    let targetMonth = now.getMonth();

    // Check current month first, if empty try last month
    let monthRuns = getMonthActivities(config.activities, targetYear, targetMonth);
    if (monthRuns.length === 0) {
      targetMonth = targetMonth === 0 ? 11 : targetMonth - 1;
      targetYear = targetMonth === 11 ? targetYear - 1 : targetYear;
      monthRuns = getMonthActivities(config.activities, targetYear, targetMonth);
    }

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    if (config.theme === "dark") {
      grad.addColorStop(0, "#141414");
      grad.addColorStop(0.4, "#1a1008");
      grad.addColorStop(1, "#141414");
    } else {
      grad.addColorStop(0, "rgba(20,20,20,0)");
      grad.addColorStop(1, "rgba(20,20,20,0)");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Border
    const inset = 32;
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2);

    const monthName = new Date(targetYear, targetMonth, 1).toLocaleString("en-US", { month: "long" }).toUpperCase();

    // Header
    let curY = 100;
    drawTextCentered(ctx, "MONTHLY WRAP-UP", W / 2, curY, "500 14px 'JetBrains Mono', monospace", c.accent);
    curY += 56;
    drawTextCentered(ctx, `${monthName} ${targetYear}`, W / 2, curY, "700 64px 'Plus Jakarta Sans', sans-serif", c.text);
    curY += 36;

    if (config.athleteName) {
      drawTextCentered(ctx, config.athleteName.toUpperCase(), W / 2, curY, "500 18px 'JetBrains Mono', monospace", c.textDim);
      curY += 20;
    }

    if (monthRuns.length === 0) {
      drawTextCentered(ctx, "No runs this month", W / 2, H / 2, "400 28px 'Plus Jakarta Sans', sans-serif", c.textMuted);
      drawWatermark(ctx, W / 2 - 50, H - inset - 16, c.textDim, 14);
      return;
    }

    // Compute stats
    const totalKm = monthRuns.reduce((s, a) => s + a.distance / 1000, 0);
    const totalTime = monthRuns.reduce((s, a) => s + a.moving_time, 0);
    const totalElev = monthRuns.reduce((s, a) => s + (a.total_elevation_gain || 0), 0);
    const avgPace = totalKm > 0 ? totalTime / 60 / totalKm : 0;

    // Hero stat: Total KM
    curY += 50;
    drawTextCentered(ctx, "TOTAL DISTANCE", W / 2, curY, "500 16px 'JetBrains Mono', monospace", c.textDim);
    curY += 100;
    drawTextCentered(ctx, `${Math.round(totalKm)}`, W / 2, curY, "400 140px 'Bebas Neue', sans-serif", c.accent);
    curY += 28;
    drawTextCentered(ctx, "KILOMETERS", W / 2, curY, "500 22px 'JetBrains Mono', monospace", c.textMuted);

    // Supporting stats row
    curY += 80;
    const supportStats = [
      { label: "RUNS", value: `${monthRuns.length}` },
      { label: "TIME", value: `${Math.round(totalTime / 3600)}h ${Math.round((totalTime % 3600) / 60)}m` },
      { label: "AVG PACE", value: avgPace > 0 ? `${formatPace(avgPace)}` : "—" },
      { label: "ELEVATION", value: `${Math.round(totalElev)}m` },
    ];

    const statColW = (W - 120) / supportStats.length;
    for (let i = 0; i < supportStats.length; i++) {
      const sx = 60 + statColW * i + statColW / 2;
      ctx.font = "600 36px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = c.text;
      const vw = ctx.measureText(supportStats[i].value).width;
      ctx.fillText(supportStats[i].value, sx - vw / 2, curY);

      ctx.font = "400 12px 'JetBrains Mono', Menlo, monospace";
      ctx.fillStyle = c.textDim;
      ctx.letterSpacing = "2px";
      const lw = ctx.measureText(supportStats[i].label).width;
      ctx.fillText(supportStats[i].label, sx - lw / 2, curY + 24);
      ctx.letterSpacing = "0px";
    }

    // Mini calendar heatmap
    curY += 80;
    drawTextCentered(ctx, "RUNNING DAYS", W / 2, curY, "500 14px 'JetBrains Mono', monospace", c.textDim);
    curY += 30;

    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const firstDow = new Date(targetYear, targetMonth, 1).getDay(); // 0=Sun
    const runDays = new Set<number>();
    for (const a of monthRuns) {
      runDays.add(new Date(a.start_date_local).getDate());
    }

    const cellSize = 48;
    const cellGap = 8;
    const cols = 7;
    const gridW = cols * cellSize + (cols - 1) * cellGap;
    const gridX = (W - gridW) / 2;

    // Day labels
    const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
    for (let d = 0; d < 7; d++) {
      const dx = gridX + d * (cellSize + cellGap) + cellSize / 2;
      drawTextCentered(ctx, dayLabels[d], dx, curY, "500 12px 'JetBrains Mono', monospace", c.textDim);
    }
    curY += 16;

    for (let day = 1; day <= daysInMonth; day++) {
      const cellIdx = (firstDow + day - 1);
      const col = cellIdx % 7;
      const row = Math.floor(cellIdx / 7);
      const cx = gridX + col * (cellSize + cellGap);
      const cy = curY + row * (cellSize + cellGap);

      const hasRun = runDays.has(day);
      fillRoundedRect(ctx, cx, cy, cellSize, cellSize, 8, hasRun ? c.accentDim : (config.theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"));

      if (hasRun) {
        ctx.strokeStyle = c.accent;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cx, cy, cellSize, cellSize, 8);
        ctx.stroke();
      }

      drawTextCentered(ctx, `${day}`, cx + cellSize / 2, cy + cellSize / 2 + 5, "500 14px 'Plus Jakarta Sans', sans-serif", hasRun ? c.accent : c.textDim);
    }

    const calRows = Math.ceil((firstDow + daysInMonth) / 7);
    curY += calRows * (cellSize + cellGap) + 20;

    // Highlight run (longest)
    const longestRun = [...monthRuns].sort((a, b) => b.distance - a.distance)[0];
    if (longestRun && longestRun.map?.summary_polyline) {
      curY += 20;
      drawTextCentered(ctx, "HIGHLIGHT RUN", W / 2, curY, "500 14px 'JetBrains Mono', monospace", c.textDim);
      curY += 16;

      const points = decodePolyline(longestRun.map.summary_polyline);
      const routeSize = 260;
      const routeX = (W - routeSize) / 2;
      drawRouteGlow(ctx, points, routeX, curY, routeSize, c.accent, 3);
      curY += routeSize + 10;

      drawTextCentered(ctx, longestRun.name, W / 2, curY, "600 22px 'Plus Jakarta Sans', sans-serif", c.text);
      curY += 26;

      const km = (longestRun.distance / 1000).toFixed(1);
      const pace = longestRun.moving_time / 60 / (longestRun.distance / 1000);
      drawTextCentered(ctx, `${km} km · ${formatPace(pace)} /km`, W / 2, curY, "400 16px 'JetBrains Mono', monospace", c.textMuted);
      curY += 40;
    }

    // Month-over-month comparison
    const prevMonthRuns = getPrevMonthActivities(config.activities, targetYear, targetMonth);
    if (prevMonthRuns.length > 0) {
      const prevKm = prevMonthRuns.reduce((s, a) => s + a.distance / 1000, 0);
      if (prevKm > 0) {
        const change = ((totalKm - prevKm) / prevKm) * 100;
        const changeText = change >= 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`;
        const prevMonthName = new Date(
          targetMonth === 0 ? targetYear - 1 : targetYear,
          targetMonth === 0 ? 11 : targetMonth - 1,
          1
        ).toLocaleString("en-US", { month: "short" });

        const color = change >= 0 ? "#4ADE80" : "#f87171";
        drawTextCentered(ctx, `${changeText} vs ${prevMonthName}`, W / 2, curY, "600 20px 'JetBrains Mono', monospace", color);
      }
    }

    // Footer
    ctx.font = "400 14px 'JetBrains Mono', Menlo, monospace";
    ctx.fillStyle = c.textDim;
    ctx.globalAlpha = 0.5;
    ctx.fillText("lariviz.xyz", inset + 16, H - inset - 12);
    ctx.globalAlpha = 1;

    drawWatermark(ctx, W - inset - 100, H - inset - 12, c.textDim, 12);
  },
};
