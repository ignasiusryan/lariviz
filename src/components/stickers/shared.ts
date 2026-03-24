// Shared drawing utilities for sticker templates

const FONTS_LOADED = new Set<string>();

export async function loadStickerFonts() {
  if (FONTS_LOADED.size >= 2) return;

  const fonts = [
    {
      family: "Playfair Display",
      url: "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDTbtPY_Q.woff2",
      weight: "400",
      style: "italic",
    },
    {
      family: "Playfair Display",
      url: "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFiD-vYSZviVYUb_rj3ij__anPXDTnCjmHKM4nYO7KN_qiTbtbK-F2rA0s.woff2",
      weight: "700",
      style: "normal",
    },
    {
      family: "Bebas Neue",
      url: "https://fonts.gstatic.com/s/bebasneue/v14/JTUSjIg69CK48gW7PXoo9Wlhyw.woff2",
      weight: "400",
      style: "normal",
    },
  ];

  const promises = fonts.map(async (f) => {
    if (FONTS_LOADED.has(`${f.family}-${f.weight}-${f.style}`)) return;
    try {
      const face = new FontFace(f.family, `url(${f.url})`, {
        weight: f.weight,
        style: f.style,
      });
      const loaded = await face.load();
      document.fonts.add(loaded);
      FONTS_LOADED.add(`${f.family}-${f.weight}-${f.style}`);
    } catch {
      // Fallback to system fonts silently
    }
  });

  await Promise.all(promises);
}

// ── Colors ──
export const DARK = {
  bg: "rgba(20, 20, 20, 1)",
  surface: "rgba(30, 30, 30, 1)",
  border: "rgba(50, 50, 50, 1)",
  text: "#e8e8e8",
  textMuted: "#888888",
  textDim: "#555555",
  accent: "#ff8c00",
  accentDim: "rgba(255, 140, 0, 0.15)",
};

export const CLEAR = {
  bg: "transparent",
  surface: "transparent",
  border: "rgba(255, 255, 255, 0.2)",
  text: "#ffffff",
  textMuted: "rgba(255, 255, 255, 0.7)",
  textDim: "rgba(255, 255, 255, 0.4)",
  accent: "#ff8c00",
  accentDim: "rgba(255, 140, 0, 0.3)",
};

export function getColors(theme: "dark" | "clear") {
  return theme === "dark" ? DARK : CLEAR;
}

// ── Drawing helpers ──

export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string
) {
  ctx.fillStyle = color;
  drawRoundedRect(ctx, x, y, w, h, r);
  ctx.fill();
}

export function strokeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string,
  lineWidth: number
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  drawRoundedRect(ctx, x, y, w, h, r);
  ctx.stroke();
}

export function drawRoute(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  x: number,
  y: number,
  size: number,
  color: string,
  lineWidth: number = 3
) {
  if (points.length < 2) return;

  // Normalize to fit in the box
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [lat, lng] of points) {
    if (lng < minX) minX = lng;
    if (lng > maxX) maxX = lng;
    if (lat < minY) minY = lat;
    if (lat > maxY) maxY = lat;
  }

  const dX = maxX - minX || 0.001;
  const dY = maxY - minY || 0.001;
  const pad = size * 0.08;
  const effectiveSize = size - pad * 2;
  const scale = effectiveSize / Math.max(dX, dY);
  const offsetX = (effectiveSize - dX * scale) / 2 + pad + x;
  const offsetY = (effectiveSize - dY * scale) / 2 + pad + y;

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();

  for (let i = 0; i < points.length; i++) {
    const px = (points[i][1] - minX) * scale + offsetX;
    const py = (maxY - points[i][0]) * scale + offsetY;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }

  ctx.stroke();
}

export function drawRouteGlow(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  x: number,
  y: number,
  size: number,
  color: string,
  lineWidth: number = 3
) {
  // Draw glow layer
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.globalAlpha = 0.6;
  drawRoute(ctx, points, x, y, size, color, lineWidth);
  ctx.restore();
  // Draw solid layer on top
  drawRoute(ctx, points, x, y, size, color, lineWidth);
}

export function drawTextCentered(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  font: string,
  color: string
) {
  ctx.font = font;
  ctx.fillStyle = color;
  const w = ctx.measureText(text).width;
  ctx.fillText(text, cx - w / 2, y);
}

export function drawTextRight(
  ctx: CanvasRenderingContext2D,
  text: string,
  rightX: number,
  y: number,
  font: string,
  color: string
) {
  ctx.font = font;
  ctx.fillStyle = color;
  const w = ctx.measureText(text).width;
  ctx.fillText(text, rightX - w, y);
}

// Draw "LARIVIZ" watermark
export function drawWatermark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  size: number = 16
) {
  ctx.font = `600 ${size}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = color;
  ctx.fillText("LARIVIZ", x, y);
}
