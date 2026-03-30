"use client";

import { useEffect, useRef, useState } from "react";
import type { Activity } from "@/components/types";
import { templates, largeTemplates } from "./stickers/registry";
import type { InsightTemplate, InsightConfig, Shoe } from "./stickers/types";
import { loadStickerFonts } from "./stickers/shared";

interface Props {
  activities: Activity[];
  athleteName: string;
  shoes: Shoe[];
}

/** Render a sticker template onto a canvas at a given scale factor */
function renderScaled(
  canvas: HTMLCanvasElement,
  template: InsightTemplate,
  config: InsightConfig,
  scale: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = template.width * scale;
  canvas.height = template.height * scale;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, template.width, template.height);
  try {
    template.render(ctx, config);
  } catch {
    /* silently fail */
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// ── Thumbnail ──
function InsightThumb({
  template,
  config,
  selected,
  onClick,
  isClear,
}: {
  template: InsightTemplate;
  config: InsightConfig;
  selected: boolean;
  onClick: () => void;
  isClear: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    renderScaled(canvas, template, config, dpr);
  }, [template, config]);

  return (
    <button
      onClick={onClick}
      className="sticker-thumb"
      style={{
        background: selected ? "var(--orange-1)" : "var(--bg)",
        border: selected ? "2px solid var(--orange-4)" : "2px solid var(--border)",
        borderRadius: "14px",
        padding: "10px",
        cursor: "pointer",
        transition: "all 0.15s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        aspectRatio: "1",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "auto",
          borderRadius: "8px",
          aspectRatio: "1",
          objectFit: "contain",
          background: isClear ? "#1a1a1a" : undefined,
        }}
      />
      <span
        style={{
          fontSize: "0.68rem",
          fontFamily: "var(--font-mono)",
          color: selected ? "var(--orange-5)" : "var(--text-muted)",
          fontWeight: selected ? 600 : 400,
          letterSpacing: "0.02em",
        }}
      >
        {template.name}
      </span>
    </button>
  );
}

// ── Full preview with download ──
function InsightPreview({
  template,
  config,
  isClear,
}: {
  template: InsightTemplate;
  config: InsightConfig;
  isClear: boolean;
}) {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const downloadRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Render preview at device DPR for crisp display
    if (previewRef.current) {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      renderScaled(previewRef.current, template, config, dpr);
    }
    // Render download canvas: 3x for small stickers, 1x for large formats (1080+)
    if (downloadRef.current) {
      const downloadScale = template.width >= 1080 ? 1 : 3;
      renderScaled(downloadRef.current, template, config, downloadScale);
    }
  }, [template, config]);

  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const canvas = downloadRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `lariviz-${template.id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleCopy = async () => {
    const canvas = downloadRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) return;
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not supported or permission denied
    }
  };

  const handleDownloadStory = () => {
    const canvas = downloadRef.current;
    if (!canvas) return;
    const storyW = 1080, storyH = 1920;
    const storyCanvas = document.createElement("canvas");
    storyCanvas.width = storyW;
    storyCanvas.height = storyH;
    const sCtx = storyCanvas.getContext("2d");
    if (!sCtx) return;

    // Gradient background
    const grad = sCtx.createLinearGradient(0, 0, 0, storyH);
    grad.addColorStop(0, "#1a1a2e");
    grad.addColorStop(0.5, "#16213e");
    grad.addColorStop(1, "#0f3460");
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, storyW, storyH);

    // Center the sticker (scale 540→810 = 1.5x to look good on 1080 wide)
    const stickerScale = 1.5;
    const stickerW = template.width * stickerScale;
    const stickerH = template.height * stickerScale;
    const sx = (storyW - stickerW) / 2;
    const sy = (storyH - stickerH) / 2;
    sCtx.drawImage(canvas, sx, sy, stickerW, stickerH);

    const link = document.createElement("a");
    link.download = `lariviz-story-${template.id}.png`;
    link.href = storyCanvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
      <div
        style={{
          background: isClear
            ? "repeating-conic-gradient(#1a1a1a 0% 25%, #222 0% 50%) 50% / 20px 20px"
            : "repeating-conic-gradient(#e0e0e0 0% 25%, #f0f0f0 0% 50%) 50% / 20px 20px",
          borderRadius: "16px",
          padding: "20px",
          display: "inline-block",
          maxWidth: "100%",
        }}
      >
        <canvas
          ref={previewRef}
          style={{
            width: "min(400px, 100%)",
            height: "auto",
            borderRadius: "12px",
            aspectRatio: `${template.width} / ${template.height}`,
          }}
        />
        {/* Hidden high-res canvas for download */}
        <canvas ref={downloadRef} style={{ display: "none" }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: "0.5rem" }}>
          {template.description}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={handleDownload}
            style={{
              background: "var(--orange-5)",
              color: "#000",
              border: "none",
              padding: "0.6rem 1.5rem",
              borderRadius: "10px",
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            Download PNG
          </button>
          <button
            onClick={handleCopy}
            style={{
              background: copied ? "#4ADE80" : "var(--bg)",
              color: copied ? "#000" : "var(--text)",
              border: "1px solid var(--border)",
              padding: "0.6rem 1.5rem",
              borderRadius: "10px",
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          {template.width <= 540 && (
            <button
              onClick={handleDownloadStory}
              style={{
                background: "var(--bg)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                padding: "0.6rem 1.5rem",
                borderRadius: "10px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              Download as Story
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main StickerTab ──
export function StickerTab({ activities, athleteName, shoes }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("top-gears");
  const [theme, setTheme] = useState<"dark" | "clear">("dark");
  const [fontsReady, setFontsReady] = useState(false);
  const [selectedRunA, setSelectedRunA] = useState<Activity | null>(null);
  const [selectedRunB, setSelectedRunB] = useState<Activity | null>(null);

  useEffect(() => {
    loadStickerFonts().then(() => setFontsReady(true));
  }, []);

  const allTemplates = [...templates, ...largeTemplates];
  const currentTemplate = allTemplates.find((t) => t.id === selectedTemplate) || templates[0];

  const runsWithPolyline = activities.filter(
    (a) => a.map?.summary_polyline && a.map.summary_polyline.length > 0
  );

  const effectiveActivities =
    currentTemplate.id === "run-comparison" && selectedRunA
      ? [selectedRunA, ...activities.filter((a) => a.id !== selectedRunA.id)]
      : activities;

  const config: InsightConfig = {
    activities: effectiveActivities,
    theme,
    athleteName,
    shoes,
    selectedRunB: selectedRunB || undefined,
  };

  if (!fontsReady) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
        Loading sticker fonts...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Theme toggle */}
      <div style={{ display: "flex", gap: "0.25rem" }}>
        {(["dark", "clear"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            style={{
              padding: "0.35rem 0.75rem",
              border: theme === t ? "1px solid var(--orange-3)" : "1px solid var(--border)",
              borderRadius: "6px",
              background: theme === t ? "var(--orange-1)" : "transparent",
              color: theme === t ? "var(--orange-5)" : "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Run comparison picker */}
      {currentTemplate.id === "run-comparison" && (
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {/* Run A picker */}
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontSize: "0.65rem",
                fontFamily: "var(--font-mono)",
                color: "#ff8c00",
                marginBottom: "0.35rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Run A
            </label>
            <div
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            >
              {runsWithPolyline.map((a) => (
                <button
                  key={`a-${a.id}`}
                  onClick={() => setSelectedRunA(a)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "0.45rem 0.6rem",
                    background: selectedRunA?.id === a.id ? "rgba(255,140,0,0.1)" : "transparent",
                    border: "none",
                    borderBottom: "1px solid var(--border)",
                    borderLeft: selectedRunA?.id === a.id ? "3px solid #ff8c00" : "3px solid transparent",
                    cursor: "pointer",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <div style={{ fontSize: "0.72rem", color: "var(--text)", fontWeight: 500 }}>
                    {a.name}
                  </div>
                  <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    {new Date(a.start_date_local).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {" \u00b7 "}
                    {(a.distance / 1000).toFixed(1)} km
                  </div>
                </button>
              ))}
              {runsWithPolyline.length === 0 && (
                <div style={{ padding: "1rem", fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "center" }}>
                  No runs with routes
                </div>
              )}
            </div>
          </div>
          {/* Run B picker */}
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontSize: "0.65rem",
                fontFamily: "var(--font-mono)",
                color: "#2dd4bf",
                marginBottom: "0.35rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Run B
            </label>
            <div
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            >
              {runsWithPolyline.map((a) => (
                <button
                  key={`b-${a.id}`}
                  onClick={() => setSelectedRunB(a)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "0.45rem 0.6rem",
                    background: selectedRunB?.id === a.id ? "rgba(45,212,191,0.1)" : "transparent",
                    border: "none",
                    borderBottom: "1px solid var(--border)",
                    borderLeft: selectedRunB?.id === a.id ? "3px solid #2dd4bf" : "3px solid transparent",
                    cursor: "pointer",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <div style={{ fontSize: "0.72rem", color: "var(--text)", fontWeight: 500 }}>
                    {a.name}
                  </div>
                  <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    {new Date(a.start_date_local).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {" \u00b7 "}
                    {(a.distance / 1000).toFixed(1)} km
                  </div>
                </button>
              ))}
              {runsWithPolyline.length === 0 && (
                <div style={{ padding: "1rem", fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "center" }}>
                  No runs with routes
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      <InsightPreview template={currentTemplate} config={config} isClear={theme === "clear"} />

      {/* Template gallery */}
      <div>
        <label style={sectionLabel}>Insight Stickers</label>
        <div
          className="sticker-gallery"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "0.6rem",
          }}
        >
          {templates.map((t) => (
            <InsightThumb
              key={t.id}
              template={t}
              config={config}
              selected={selectedTemplate === t.id}
              onClick={() => setSelectedTemplate(t.id)}
              isClear={theme === "clear"}
            />
          ))}
        </div>
      </div>

      {/* Large format templates */}
      <div>
        <label style={sectionLabel}>Share Cards</label>
        <div
          className="sticker-gallery"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "0.6rem",
          }}
        >
          {largeTemplates.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              className="sticker-thumb"
              style={{
                background: selectedTemplate === t.id ? "var(--orange-1)" : "var(--bg)",
                border: selectedTemplate === t.id ? "2px solid var(--orange-4)" : "2px solid var(--border)",
                borderRadius: "14px",
                padding: "12px",
                cursor: "pointer",
                transition: "all 0.15s",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <div style={{
                fontSize: "0.6rem",
                fontFamily: "var(--font-mono)",
                color: "var(--text-muted)",
                background: "var(--border)",
                padding: "2px 6px",
                borderRadius: "4px",
              }}>
                {t.width}x{t.height}
              </div>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontFamily: "var(--font-mono)",
                  color: selectedTemplate === t.id ? "var(--orange-5)" : "var(--text-muted)",
                  fontWeight: selectedTemplate === t.id ? 600 : 400,
                  letterSpacing: "0.02em",
                }}
              >
                {t.name}
              </span>
              <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                {t.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {activities.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
          No runs found. Try a different filter.
        </div>
      )}
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  display: "block",
  fontSize: "0.7rem",
  fontFamily: "var(--font-mono)",
  color: "var(--text-muted)",
  marginBottom: "0.5rem",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
};
