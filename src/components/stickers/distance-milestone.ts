import type { InsightTemplate, InsightConfig } from "./types";
import { getColors, drawTextCentered, drawWatermark, fillRoundedRect } from "./shared";
import { detectMilestones, type Milestone } from "./milestone-unlocked";

const W = 1080, H = 1080;

export const distanceMilestone: InsightTemplate = {
  id: "distance-milestone",
  name: "Distance Milestone",
  description: "Progress ring sticker for distance milestones",
  width: W,
  height: H,
  render(ctx: CanvasRenderingContext2D, config: InsightConfig) {
    const c = getColors(config.theme);
    const inset = 32;

    // Background
    if (config.theme === "dark") {
      ctx.fillStyle = c.bg;
      ctx.fillRect(0, 0, W, H);
    }

    // Border
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2);

    const milestones = detectMilestones(config.activities);

    if (milestones.length === 0) {
      drawTextCentered(ctx, "Keep running to unlock milestones!", W / 2, H / 2, "400 24px 'Plus Jakarta Sans', sans-serif", c.textMuted);
      return;
    }

    const m = milestones[0];

    // "MILESTONE ACHIEVED" header
    drawTextCentered(ctx, "MILESTONE ACHIEVED", W / 2, 100, "500 14px 'JetBrains Mono', monospace", c.accent);

    // ── Progress ring ──
    const ringCx = W / 2;
    const ringCy = 320;
    const ringR = 160;
    const progress = Math.min(1, m.progress);

    // Background ring
    ctx.beginPath();
    ctx.arc(ringCx, ringCy, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = config.theme === "dark" ? c.border : "rgba(255,255,255,0.1)";
    ctx.lineWidth = 12;
    ctx.stroke();

    // Filled arc (orange gradient)
    if (progress > 0) {
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + progress * Math.PI * 2;
      const grad = ctx.createLinearGradient(ringCx - ringR, ringCy, ringCx + ringR, ringCy);
      grad.addColorStop(0, "#ff8c00");
      grad.addColorStop(1, "#ffb347");
      ctx.beginPath();
      ctx.arc(ringCx, ringCy, ringR, startAngle, endAngle);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 12;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.lineCap = "butt";
    }

    // Decorative tick marks
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 * Math.PI) / 180 - Math.PI / 2;
      const innerR = 175;
      const outerR = 182;
      const x1 = ringCx + Math.cos(angle) * innerR;
      const y1 = ringCy + Math.sin(angle) * innerR;
      const x2 = ringCx + Math.cos(angle) * outerR;
      const y2 = ringCy + Math.sin(angle) * outerR;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = c.textDim;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Value inside ring
    const valueText = m.type === "pace" ? m.label.replace("Sub-", "").replace(" /km", "") : m.value.toLocaleString();
    drawTextCentered(ctx, valueText, ringCx, ringCy - 10, "400 96px 'Bebas Neue', sans-serif", c.text);

    // Unit below value
    const unitText = m.unit.toUpperCase();
    drawTextCentered(ctx, unitText, ringCx, ringCy + 40, "500 22px 'JetBrains Mono', monospace", c.textMuted);

    // Milestone label
    drawTextCentered(ctx, m.label, W / 2, 560, "700 32px 'Plus Jakarta Sans', sans-serif", c.text);

    // Date achieved
    const dateStr = new Date(m.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    drawTextCentered(ctx, `Achieved ${dateStr}`, W / 2, 600, "400 18px 'Plus Jakarta Sans', sans-serif", c.textMuted);

    // Run name
    drawTextCentered(ctx, `during "${m.runName}"`, W / 2, 632, "400 14px 'JetBrains Mono', monospace", c.textDim);

    // Divider
    ctx.beginPath();
    ctx.moveTo(80, 680);
    ctx.lineTo(W - 80, 680);
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.stroke();

    // NEXT section
    if (m.next) {
      const pct = Math.round(progress * 100);

      // Left: "NEXT: X UNIT"
      ctx.font = "500 16px 'JetBrains Mono', monospace";
      ctx.fillStyle = c.textDim;
      ctx.fillText(`NEXT: ${m.next.toLocaleString()} ${m.unit.toUpperCase()}`, 80, 720);

      // Right: "XX%"
      const pctText = `${pct}%`;
      ctx.font = "600 16px 'JetBrains Mono', monospace";
      ctx.fillStyle = c.accent;
      const pctW = ctx.measureText(pctText).width;
      ctx.fillText(pctText, W - 80 - pctW, 720);

      // Progress bar
      const barX = 80, barY = 745, barW = W - 160, barH = 12, barR = 6;

      // Bar background
      fillRoundedRect(ctx, barX, barY, barW, barH, barR, config.theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)");

      // Bar fill
      const fillW = Math.max(barH, barW * progress);
      const barGrad = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
      barGrad.addColorStop(0, "#ff8c00");
      barGrad.addColorStop(1, "#ffb347");
      ctx.fillStyle = barGrad;
      ctx.beginPath();
      ctx.roundRect(barX, barY, fillW, barH, barR);
      ctx.fill();
    }

    // Athlete name bottom-left
    if (config.athleteName) {
      ctx.font = "600 12px 'JetBrains Mono', monospace";
      ctx.fillStyle = c.textDim;
      ctx.fillText(config.athleteName.toUpperCase(), inset + 16, H - inset - 12);
    }

    // Watermark bottom-right
    drawWatermark(ctx, W - inset - 16 - 80, H - inset - 12, c.textDim, 12);
  },
};
