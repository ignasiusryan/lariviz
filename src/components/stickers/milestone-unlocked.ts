import type { InsightTemplate, InsightConfig } from "./types";
import { getColors, drawTextCentered, drawWatermark, fillRoundedRect, strokeRoundedRect } from "./shared";

const W = 540, H = 540;

interface Milestone {
  type: string;
  label: string;
  value: number;
  unit: string;
  date: string;
  runName: string;
  next: number | null;
  progress: number; // 0-1 toward next
}

const DISTANCE_THRESHOLDS = [100, 250, 500, 1000, 2000, 5000];
const COUNT_THRESHOLDS = [10, 25, 50, 100, 250, 500, 1000];
const PACE_THRESHOLDS = [
  { label: "Sub-6:00 /km", threshold: 6.0 },
  { label: "Sub-5:30 /km", threshold: 5.5 },
  { label: "Sub-5:00 /km", threshold: 5.0 },
  { label: "Sub-4:30 /km", threshold: 4.5 },
];
const RACE_DISTANCES = [
  { label: "First 10K", minDist: 10000, maxDist: 20000 },
  { label: "First Half Marathon", minDist: 21000, maxDist: 41000 },
  { label: "First Marathon", minDist: 42000, maxDist: 50000 },
];

function detectMilestones(activities: InsightConfig["activities"]): Milestone[] {
  const milestones: Milestone[] = [];
  const sorted = [...activities].sort((a, b) => new Date(a.start_date_local).getTime() - new Date(b.start_date_local).getTime());

  // Distance milestones (cumulative km)
  let cumKm = 0;
  const distHit = new Set<number>();
  for (const a of sorted) {
    cumKm += a.distance / 1000;
    for (const t of DISTANCE_THRESHOLDS) {
      if (cumKm >= t && !distHit.has(t)) {
        distHit.add(t);
        const nextT = DISTANCE_THRESHOLDS.find((x) => x > t) ?? null;
        milestones.push({
          type: "distance",
          label: `${t.toLocaleString()} KM`,
          value: t,
          unit: "km",
          date: a.start_date_local,
          runName: a.name,
          next: nextT,
          progress: nextT ? cumKm / nextT : 1,
        });
      }
    }
  }

  // Run count milestones
  for (let i = 0; i < sorted.length; i++) {
    const count = i + 1;
    for (const t of COUNT_THRESHOLDS) {
      if (count === t) {
        const nextT = COUNT_THRESHOLDS.find((x) => x > t) ?? null;
        milestones.push({
          type: "count",
          label: `${t} RUNS`,
          value: t,
          unit: "runs",
          date: sorted[i].start_date_local,
          runName: sorted[i].name,
          next: nextT,
          progress: nextT ? count / nextT : 1,
        });
      }
    }
  }

  // Pace PR milestones
  const paceHit = new Set<number>();
  for (const a of sorted) {
    if (a.distance < 5000 || a.moving_time <= 0) continue;
    const pace = (a.moving_time / 60) / (a.distance / 1000);
    for (const { label, threshold } of PACE_THRESHOLDS) {
      if (pace < threshold && !paceHit.has(threshold)) {
        paceHit.add(threshold);
        milestones.push({
          type: "pace",
          label,
          value: threshold,
          unit: "/km",
          date: a.start_date_local,
          runName: a.name,
          next: null,
          progress: 1,
        });
      }
    }
  }

  // Race distance milestones
  const raceHit = new Set<string>();
  for (const a of sorted) {
    for (const { label, minDist, maxDist } of RACE_DISTANCES) {
      if (a.distance >= minDist && a.distance <= maxDist && !raceHit.has(label)) {
        raceHit.add(label);
        milestones.push({
          type: "race",
          label,
          value: a.distance / 1000,
          unit: "km",
          date: a.start_date_local,
          runName: a.name,
          next: null,
          progress: 1,
        });
      }
    }
  }

  // Sort by impressiveness: distance > count > race > pace, then by value desc
  const typeOrder: Record<string, number> = { distance: 0, count: 1, race: 2, pace: 3 };
  milestones.sort((a, b) => {
    const ta = typeOrder[a.type] ?? 9;
    const tb = typeOrder[b.type] ?? 9;
    if (ta !== tb) return ta - tb;
    return b.value - a.value;
  });

  return milestones;
}

export const milestoneUnlocked: InsightTemplate = {
  id: "milestone-unlocked",
  name: "Milestone Unlocked",
  description: "Achievement badge for your biggest milestones",
  width: W,
  height: H,
  render(ctx: CanvasRenderingContext2D, config: InsightConfig) {
    const c = getColors(config.theme);

    if (config.theme === "dark") {
      ctx.fillStyle = c.bg;
      ctx.fillRect(0, 0, W, H);
    }

    const milestones = detectMilestones(config.activities);

    if (milestones.length === 0) {
      drawTextCentered(ctx, "Keep running to unlock milestones!", W / 2, H / 2, "400 16px 'Plus Jakarta Sans', sans-serif", c.textMuted);
      return;
    }

    const m = milestones[0];

    // "MILESTONE UNLOCKED" header
    drawTextCentered(ctx, "MILESTONE UNLOCKED", W / 2, 56, "500 11px 'JetBrains Mono', monospace", c.accent);

    // Decorative badge/shield
    const badgeCx = W / 2;
    const badgeCy = 200;
    const badgeR = 95;

    // Outer glow
    ctx.save();
    ctx.shadowColor = c.accent;
    ctx.shadowBlur = 30;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(badgeCx, badgeCy, badgeR, 0, Math.PI * 2);
    ctx.fillStyle = c.accent;
    ctx.fill();
    ctx.restore();

    // Badge outer ring
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(badgeCx, badgeCy, badgeR, 0, Math.PI * 2);
    ctx.stroke();

    // Badge inner ring (dashed)
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(badgeCx, badgeCy, badgeR - 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    // Badge fill
    ctx.beginPath();
    ctx.arc(badgeCx, badgeCy, badgeR - 16, 0, Math.PI * 2);
    ctx.fillStyle = c.accentDim;
    ctx.fill();

    // Milestone value inside badge
    const valueText = m.type === "pace" ? m.label.replace("Sub-", "").replace(" /km", "") : m.value.toLocaleString();
    const valueSize = valueText.length > 4 ? 48 : 64;
    drawTextCentered(ctx, valueText, badgeCx, badgeCy + valueSize * 0.35, `400 ${valueSize}px 'Bebas Neue', sans-serif`, c.text);

    // Unit below value
    if (m.type !== "pace") {
      drawTextCentered(ctx, m.unit.toUpperCase(), badgeCx, badgeCy + valueSize * 0.35 + 22, "500 12px 'JetBrains Mono', monospace", c.textMuted);
    }

    // Milestone label
    drawTextCentered(ctx, m.label, W / 2, 340, "700 28px 'Plus Jakarta Sans', sans-serif", c.text);

    // Date achieved
    const dateStr = new Date(m.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    drawTextCentered(ctx, dateStr, W / 2, 370, "400 14px 'Plus Jakarta Sans', sans-serif", c.textMuted);

    // Triggering run
    drawTextCentered(ctx, m.runName, W / 2, 394, "400 12px 'JetBrains Mono', monospace", c.textDim);

    // Progress bar to next milestone
    if (m.next) {
      const barX = 80, barY = 430, barW = W - 160, barH = 10, barR = 5;

      drawTextCentered(ctx, `NEXT: ${m.next.toLocaleString()} ${m.unit}`, W / 2, barY - 14, "500 10px 'JetBrains Mono', monospace", c.textDim);

      // Bar background
      fillRoundedRect(ctx, barX, barY, barW, barH, barR, config.theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)");

      // Bar fill
      const progress = Math.min(1, m.progress);
      const fillW = Math.max(barH, barW * progress);
      const grad = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
      grad.addColorStop(0, "#ff8c00");
      grad.addColorStop(1, "#ffb347");
      fillRoundedRect(ctx, barX, barY, fillW, barH, barR, "");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(barX, barY, fillW, barH, barR);
      ctx.fill();

      drawTextCentered(ctx, `${Math.round(progress * 100)}%`, W / 2, barY + barH + 22, "600 12px 'JetBrains Mono', monospace", c.accent);
    }

    // Athlete name
    if (config.athleteName) {
      drawTextCentered(ctx, config.athleteName.toUpperCase(), W / 2, H - 48, "600 10px 'JetBrains Mono', monospace", c.textDim);
    }

    // Footer
    drawWatermark(ctx, W / 2 - 30, H - 24, c.textDim, 10);
  },
};
