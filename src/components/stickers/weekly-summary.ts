import type { InsightTemplate, InsightConfig } from "./types";
import { getColors, drawTextCentered, drawWatermark, fillRoundedRect } from "./shared";
import { formatPace } from "@/lib/format";

const W = 540, H = 540;

export const weeklySummary: InsightTemplate = {
  id: "weekly-summary",
  name: "Weekly Summary",
  description: "Bar chart overview of your most recent training week",
  width: W,
  height: H,
  render(ctx: CanvasRenderingContext2D, config: InsightConfig) {
    const c = getColors(config.theme);

    // Background
    if (config.theme === "dark") {
      ctx.fillStyle = c.bg;
      ctx.fillRect(0, 0, W, H);
    }

    // Border
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    // ── Data preparation ──

    // Find the Monday of the current week
    const now = new Date();
    const nowDay = now.getDay();
    const nowDiff = now.getDate() - nowDay + (nowDay === 0 ? -6 : 1);
    let weekMonday = new Date(now);
    weekMonday.setDate(nowDiff);
    weekMonday.setHours(0, 0, 0, 0);

    // Check if there are any runs this week
    const weekEnd = new Date(weekMonday);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const hasRunsThisWeek = config.activities.some((a) => {
      const d = new Date(a.start_date_local);
      return d >= weekMonday && d < weekEnd;
    });

    // If no runs this week, use the previous week
    if (!hasRunsThisWeek) {
      weekMonday = new Date(weekMonday);
      weekMonday.setDate(weekMonday.getDate() - 7);
    }

    const weekSunday = new Date(weekMonday);
    weekSunday.setDate(weekSunday.getDate() + 6);

    // Group activities by day of week (Mon=0 through Sun=6)
    const dayKm: number[] = [0, 0, 0, 0, 0, 0, 0];
    let totalKm = 0;
    let runCount = 0;
    let totalMovingTime = 0;
    let totalDistance = 0;

    const weekEndDate = new Date(weekMonday);
    weekEndDate.setDate(weekEndDate.getDate() + 7);

    for (const a of config.activities) {
      const d = new Date(a.start_date_local);
      if (d >= weekMonday && d < weekEndDate) {
        const dayOfWeek = d.getDay();
        // Convert Sun=0,Mon=1,...Sat=6 to Mon=0,...Sun=6
        const idx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const km = (a.distance || 0) / 1000;
        dayKm[idx] += km;
        totalKm += km;
        runCount++;
        totalMovingTime += a.moving_time || 0;
        totalDistance += a.distance || 0;
      }
    }

    const maxDayKm = Math.max(...dayKm, 0.001);

    // Average pace (min/km)
    const avgPace = totalDistance > 0 ? (totalMovingTime / 60) / (totalDistance / 1000) : 0;

    // ── Header ──

    // "THIS WEEK" left-aligned
    ctx.font = "500 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = c.accent;
    ctx.fillText("THIS WEEK", 40, 52);

    // Date range right-aligned
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monMonth = monthNames[weekMonday.getMonth()];
    const sunMonth = monthNames[weekSunday.getMonth()];
    const dateRange = monMonth === sunMonth
      ? `${monMonth} ${weekMonday.getDate()} - ${weekSunday.getDate()}`
      : `${monMonth} ${weekMonday.getDate()} - ${sunMonth} ${weekSunday.getDate()}`;

    ctx.font = "500 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = c.textMuted;
    const dateW = ctx.measureText(dateRange).width;
    ctx.fillText(dateRange, W - 40 - dateW, 52);

    // ── Bars ──

    const barWidth = 50;
    const barGap = 12;
    const totalBarsWidth = 7 * barWidth + 6 * barGap; // 422
    const startX = (W - totalBarsWidth) / 2;
    const barsTop = 100;
    const barsBottom = 360;
    const maxBarHeight = 260;
    const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

    for (let i = 0; i < 7; i++) {
      const x = startX + i * (barWidth + barGap);

      if (dayKm[i] > 0) {
        // Active day bar
        const barH = Math.max(8, (dayKm[i] / maxDayKm) * maxBarHeight);
        const barY = barsBottom - barH;
        fillRoundedRect(ctx, x, barY, barWidth, barH, 8, c.accent);
      } else {
        // Empty day placeholder
        fillRoundedRect(ctx, x, barsBottom - 4, barWidth, 4, 8, "rgba(255,255,255,0.04)");
      }

      // Day label
      drawTextCentered(ctx, dayLabels[i], x + barWidth / 2, 380, "500 12px 'JetBrains Mono', monospace", c.textDim);
    }

    // ── Stats row ──

    const statsText = `${totalKm.toFixed(1)} km  ·  ${runCount} runs  ·  ${avgPace > 0 ? formatPace(avgPace) : "--:--"}`;
    drawTextCentered(ctx, statsText, W / 2, 420, "500 14px 'JetBrains Mono', monospace", c.textMuted);

    // ── Divider ──

    ctx.fillStyle = c.border;
    ctx.fillRect(60, 440, W - 120, 1);

    // ── Streak ──

    // Calculate consecutive weeks with ≥1 run going backward from the current week
    const weeksWithRuns = new Set<string>();
    for (const a of config.activities) {
      const d = new Date(a.start_date_local);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d);
      monday.setDate(diff);
      monday.setHours(0, 0, 0, 0);
      weeksWithRuns.add(monday.toISOString().slice(0, 10));
    }

    let streakWeeks = 0;
    const checkMonday = new Date(weekMonday);
    while (weeksWithRuns.has(checkMonday.toISOString().slice(0, 10))) {
      streakWeeks++;
      checkMonday.setDate(checkMonday.getDate() - 7);
    }

    const streakText = `${streakWeeks} week streak`;
    drawTextCentered(ctx, streakText, W / 2, 468, "600 13px 'JetBrains Mono', monospace", c.accent);

    // ── Watermark ──

    drawWatermark(ctx, W / 2 - 30, H - 24, c.textDim, 10);
  },
};
