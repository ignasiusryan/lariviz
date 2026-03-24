import type { StickerTemplate, StickerConfig } from "./types";
import { getColors, fillRoundedRect, strokeRoundedRect, drawWatermark } from "./shared";

// "Gauge" — speedometer-inspired with pace arc
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

  // Pace arc (semi-circle at top)
  const arcCy = 230 * S;
  const arcR = 150 * S;
  const arcStart = Math.PI;
  const arcEnd = Math.PI * 2;

  // Background arc track
  ctx.strokeStyle = c.border;
  ctx.lineWidth = 8 * S;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, arcCy, arcR, arcStart, arcEnd);
  ctx.stroke();

  // Pace value arc — fill proportionally (assume 4:00-9:00 /km range)
  const paceStr = config.pace;
  const paceMatch = paceStr.match(/(\d+):(\d+)/);
  let paceMinutes = 6.5; // default
  if (paceMatch) {
    paceMinutes = parseInt(paceMatch[1]) + parseInt(paceMatch[2]) / 60;
  }
  const normalized = Math.max(0, Math.min(1, (9 - paceMinutes) / 5)); // faster = more filled
  const fillEnd = arcStart + normalized * Math.PI;

  // Gradient-like accent arc
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 8 * S;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, arcCy, arcR, arcStart, fillEnd);
  ctx.stroke();

  // Glow on the accent arc
  ctx.save();
  ctx.shadowColor = c.accent;
  ctx.shadowBlur = 15 * S;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.arc(cx, arcCy, arcR, arcStart, fillEnd);
  ctx.stroke();
  ctx.restore();

  // Tick marks around the arc
  for (let i = 0; i <= 10; i++) {
    const angle = arcStart + (i / 10) * Math.PI;
    const inner = arcR - 18 * S;
    const outer = arcR - 12 * S;
    ctx.strokeStyle = i <= normalized * 10 ? c.accent : c.textDim;
    ctx.lineWidth = 1.5 * S;
    ctx.beginPath();
    ctx.moveTo(cx + inner * Math.cos(angle), arcCy + inner * Math.sin(angle));
    ctx.lineTo(cx + outer * Math.cos(angle), arcCy + outer * Math.sin(angle));
    ctx.stroke();
  }

  // Pace value in center of arc
  ctx.font = `800 ${52 * S}px Outfit, sans-serif`;
  ctx.fillStyle = c.text;
  const paceW = ctx.measureText(config.pace).width;
  ctx.fillText(config.pace, cx - paceW / 2, arcCy + 10 * S);

  ctx.font = `400 ${14 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.textDim;
  const unitW = ctx.measureText("/km").width;
  ctx.fillText("/km", cx - unitW / 2, arcCy + 32 * S);

  // Bottom stats — three columns
  const statY = 350 * S;
  const stats = [
    { label: "DISTANCE", value: `${config.distanceKm} km` },
    { label: "DURATION", value: config.duration },
    { label: "DATE", value: config.date },
  ];

  const colW = (W - 80 * S) / 3;
  for (let i = 0; i < stats.length; i++) {
    const sx = 40 * S + colW * i + colW / 2;

    ctx.font = `600 ${24 * S}px Outfit, sans-serif`;
    ctx.fillStyle = c.text;
    const vw = ctx.measureText(stats[i].value).width;
    ctx.fillText(stats[i].value, sx - vw / 2, statY + 20 * S);

    ctx.font = `400 ${10 * S}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = c.textDim;
    const lw = ctx.measureText(stats[i].label).width;
    ctx.fillText(stats[i].label, sx - lw / 2, statY + 42 * S);
  }

  // Activity name
  ctx.font = `italic 400 ${18 * S}px 'Playfair Display', Georgia, serif`;
  ctx.fillStyle = c.textMuted;
  const nameW = ctx.measureText(config.activity.name).width;
  ctx.fillText(config.activity.name, cx - nameW / 2, 450 * S);

  drawWatermark(ctx, 40 * S, H - 24 * S, c.textDim, 9 * S);
}

export const dataGrid: StickerTemplate = {
  id: "data-grid",
  name: "Gauge",
  width: W,
  height: H,
  hasCustomText: false,
  render,
};
