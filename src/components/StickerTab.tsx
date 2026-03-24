"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Activity } from "./Dashboard";
import { templates } from "./stickers/registry";
import type { StickerTemplate, StickerConfig } from "./stickers/types";
import { loadStickerFonts } from "./stickers/shared";
import { decodePolyline } from "@/lib/polyline";
import { formatDuration, formatPace, formatNumber } from "@/lib/format";
import { downloadCanvas } from "@/lib/download-theme";

interface Props {
  activities: Activity[];
}

function getLocation(a: Activity): string {
  if (a.location_city) return a.location_city;
  if (a.location_state) return a.location_state;
  if (a.timezone) {
    const match = a.timezone.match(/\/([^/]+)$/);
    if (match) return match[1].replace(/_/g, " ");
  }
  return "";
}

function buildConfig(
  activity: Activity,
  theme: "dark" | "clear",
  customText?: string
): StickerConfig {
  const distKm = activity.distance / 1000;
  const paceMin = distKm > 0 ? activity.moving_time / 60 / distKm : 0;
  const date = new Date(activity.start_date_local);
  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  let routePoints: [number, number][] = [];
  if (activity.map?.summary_polyline) {
    routePoints = decodePolyline(activity.map.summary_polyline);
  }

  // Convert literal \n to real newlines
  const processedText = customText?.replace(/\\n/g, "\n");

  return {
    activity,
    theme,
    customText: processedText,
    distanceKm: formatNumber(distKm, 2),
    pace: paceMin > 0 ? formatPace(paceMin) : "—",
    duration: formatDuration(activity.moving_time),
    date: dateStr,
    dayOfWeek,
    location: getLocation(activity),
    routePoints,
  };
}

// ── Uniform thumbnail card ──
function StickerThumb({
  template,
  config,
  selected,
  onClick,
}: {
  template: StickerTemplate;
  config: StickerConfig;
  selected: boolean;
  onClick: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = template.width;
    canvas.height = template.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      template.render(ctx, config);
    } catch {
      // silently fail
    }
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
          aspectRatio: `${template.width} / ${template.height}`,
          objectFit: "contain",
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
function StickerPreview({
  template,
  config,
}: {
  template: StickerTemplate;
  config: StickerConfig;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = template.width;
    canvas.height = template.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      template.render(ctx, config);
    } catch {
      // silently fail
    }
  }, [template, config]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    downloadCanvas(canvas, `lariviz-${template.id}.png`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
      <div
        style={{
          background: "repeating-conic-gradient(#1a1a1a 0% 25%, #222 0% 50%) 50% / 20px 20px",
          borderRadius: "16px",
          padding: "20px",
          display: "inline-block",
          maxWidth: "100%",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: "min(400px, 100%)",
            height: "auto",
            borderRadius: "12px",
            aspectRatio: `${template.width} / ${template.height}`,
          }}
        />
      </div>
      <button
        onClick={handleDownload}
        style={{
          background: "var(--orange-5)",
          color: "#000",
          border: "none",
          padding: "0.6rem 2rem",
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
    </div>
  );
}

// ── Main StickerTab ──
export function StickerTab({ activities }: Props) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("big-number");
  const [theme, setTheme] = useState<"dark" | "clear">("dark");
  const [customTexts, setCustomTexts] = useState<Record<string, string>>({});
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    loadStickerFonts().then(() => setFontsReady(true));
  }, []);

  useEffect(() => {
    if (activities.length > 0 && !selectedActivity) {
      setSelectedActivity(activities[0]);
    }
  }, [activities, selectedActivity]);

  const currentTemplate = templates.find((t) => t.id === selectedTemplate) || templates[0];

  const config = selectedActivity
    ? buildConfig(selectedActivity, theme, customTexts[selectedTemplate])
    : null;

  const setCustomText = useCallback(
    (text: string) => {
      setCustomTexts((prev) => ({ ...prev, [selectedTemplate]: text }));
    },
    [selectedTemplate]
  );

  if (!fontsReady) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
        Loading sticker fonts...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Run selector — horizontal scroll */}
      <div>
        <label style={sectionLabel}>Select a run</label>
        <div className="sticker-run-list" style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
          {activities.slice(0, 30).map((a) => {
            const km = (a.distance / 1000).toFixed(1);
            const date = new Date(a.start_date_local).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const isSelected = selectedActivity?.id === a.id;
            return (
              <button
                key={a.id}
                onClick={() => setSelectedActivity(a)}
                style={{
                  flexShrink: 0,
                  padding: "0.6rem 1rem",
                  background: isSelected ? "linear-gradient(135deg, var(--orange-1), var(--orange-2))" : "var(--bg)",
                  border: isSelected ? "1px solid var(--orange-3)" : "1px solid var(--border)",
                  borderRadius: "10px",
                  cursor: "pointer",
                  textAlign: "left",
                  minWidth: "140px",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: isSelected ? "var(--orange-5)" : "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px" }}>
                  {a.name}
                </div>
                <div style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                  {km} km · {date}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedActivity && config && (
        <>
          {/* Controls row: theme + custom text inline */}
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
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

            {currentTemplate.hasCustomText && (
              <input
                type="text"
                value={customTexts[selectedTemplate] || ""}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder={currentTemplate.textPlaceholder || "Custom text..."}
                style={{
                  flex: 1,
                  minWidth: "180px",
                  padding: "0.45rem 0.75rem",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--text)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.78rem",
                  outline: "none",
                }}
              />
            )}
          </div>

          {/* Preview */}
          <StickerPreview template={currentTemplate} config={config} />

          {/* Template gallery — uniform grid */}
          <div>
            <label style={sectionLabel}>Templates</label>
            <div
              className="sticker-gallery"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "0.6rem",
              }}
            >
              {templates.map((t) => (
                <StickerThumb
                  key={t.id}
                  template={t}
                  config={buildConfig(selectedActivity, theme)}
                  selected={selectedTemplate === t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                />
              ))}
            </div>
          </div>
        </>
      )}

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
