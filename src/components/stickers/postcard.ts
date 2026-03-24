import type { StickerTemplate, StickerConfig } from "./types";
import { getColors, fillRoundedRect, strokeRoundedRect, drawTextCentered } from "./shared";

const S = 2;
const W = 420 * S;
const H = 340 * S;

function render(ctx: CanvasRenderingContext2D, config: StickerConfig) {
  const c = getColors(config.theme);
  const pad = 30 * S;

  if (config.theme === "dark") {
    fillRoundedRect(ctx, 0, 0, W, H, 24 * S, c.bg);
    strokeRoundedRect(ctx, 0, 0, W, H, 24 * S, c.border, S);
  }

  // Inner postcard border (double line effect)
  const inset = 16 * S;
  ctx.strokeStyle = c.textDim;
  ctx.lineWidth = S;
  ctx.beginPath();
  ctx.roundRect(inset, inset, W - inset * 2, H - inset * 2, 12 * S);
  ctx.stroke();

  const cx = W / 2;

  // "RAN IN" label with pin icon
  ctx.font = `600 ${11 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.accent;
  ctx.letterSpacing = `${3 * S}px`;
  const ranInW = ctx.measureText("RAN IN").width;

  // Pin icon (simple circle + line)
  const pinX = cx - ranInW / 2 - 14 * S;
  const pinY = 62 * S;
  ctx.beginPath();
  ctx.arc(pinX, pinY - 4 * S, 4 * S, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pinX, pinY);
  ctx.lineTo(pinX, pinY + 6 * S);
  ctx.stroke();

  ctx.fillText("RAN IN", cx - ranInW / 2, 65 * S);
  ctx.letterSpacing = "0px";

  // Location — large serif
  const location = config.customText || config.location || "Unknown";
  ctx.font = `700 ${36 * S}px 'Playfair Display', Georgia, serif`;
  ctx.fillStyle = c.text;

  // Handle long location names
  const locW = ctx.measureText(location).width;
  const maxW = W - pad * 2 - inset * 2;
  if (locW > maxW) {
    const scale = maxW / locW;
    ctx.font = `700 ${Math.floor(36 * S * scale)}px 'Playfair Display', Georgia, serif`;
  }
  const finalLocW = ctx.measureText(location).width;
  ctx.fillText(location, cx - finalLocW / 2, 130 * S);

  // Divider
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 2 * S;
  ctx.beginPath();
  ctx.moveTo(cx - 50 * S, 155 * S);
  ctx.lineTo(cx + 50 * S, 155 * S);
  ctx.stroke();

  // Stats row
  const stats = [
    { label: "DISTANCE", value: `${config.distanceKm} km` },
    { label: "PACE", value: `${config.pace}/km` },
    { label: "TIME", value: config.duration },
  ];

  const statColW = (W - pad * 2 - inset * 2) / 3;
  const statStartX = pad + inset;

  for (let i = 0; i < stats.length; i++) {
    const sx = statStartX + statColW * i + statColW / 2;

    ctx.font = `600 ${9 * S}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = c.textDim;
    ctx.letterSpacing = `${2 * S}px`;
    const lw = ctx.measureText(stats[i].label).width;
    ctx.fillText(stats[i].label, sx - lw / 2, 195 * S);
    ctx.letterSpacing = "0px";

    ctx.font = `700 ${22 * S}px Outfit, sans-serif`;
    ctx.fillStyle = c.text;
    const vw = ctx.measureText(stats[i].value).width;
    ctx.fillText(stats[i].value, sx - vw / 2, 228 * S);
  }

  // Accent bar at bottom
  fillRoundedRect(ctx, inset + 4 * S, H - inset - 10 * S, W - inset * 2 - 8 * S, 4 * S, 2 * S, c.accent);

  // Watermark
  ctx.font = `600 ${9 * S}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = c.textDim;
  const wmW = ctx.measureText("LARIVIZ").width;
  ctx.fillText("LARIVIZ", cx - wmW / 2, H - inset - 22 * S);
}

export const postcard: StickerTemplate = {
  id: "postcard",
  name: "Postcard",
  width: W,
  height: H,
  hasCustomText: true,
  defaultText: "",
  textPlaceholder: "Location (e.g. Jakarta Timur)",
  render,
};
