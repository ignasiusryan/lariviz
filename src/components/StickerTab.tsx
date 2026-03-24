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

  // Convert literal \n to real newlines for poetic template
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

// ── Thumbnail preview (small canvas for gallery) ──
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
      // Render error — leave blank
    }
  }, [template, config]);

  // Calculate display size to fit in grid
  const maxDisplayW = 240;
  const aspect = template.height / template.width;
  const displayW = Math.min(maxDisplayW, 240);
  const displayH = displayW * aspect;

  return (
    <button
      onClick={onClick}
      className="sticker-thumb"
      style={{
        background: "transparent",
        border: selected
          ? "2px solid var(--orange-5)"
          : "2px solid transparent",
        borderRadius: "14px",
        padding: "8px",
        cursor: "pointer",
        transition: "all 0.15s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        opacity: selected ? 1 : 0.8,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: displayW,
          height: displayH,
          borderRadius: "10px",
        }}
      />
      <span
        style={{
          fontSize: "0.7rem",
          fontFamily: "var(--font-mono)",
          color: selected ? "var(--orange-5)" : "var(--text-muted)",
          fontWeight: selected ? 600 : 400,
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
      // Render error
    }
  }, [template, config]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    downloadCanvas(canvas, `lariviz-${template.id}.png`);
  };

  // Scale to fit nicely
  const maxW = 480;
  const aspect = template.height / template.width;
  const displayW = Math.min(maxW, 480);
  const displayH = displayW * aspect;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
      <div
        style={{
          background: "repeating-conic-gradient(#1a1a1a 0% 25%, #222 0% 50%) 50% / 20px 20px",
          borderRadius: "16px",
          padding: "24px",
          display: "inline-block",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: displayW,
            height: displayH,
            borderRadius: "12px",
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
          letterSpacing: "0.03em",
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

  // Default to first activity
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
      {/* Step 1: Select a run */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "0.7rem",
            fontFamily: "var(--font-mono)",
            color: "var(--text-muted)",
            marginBottom: "0.5rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Select a run
        </label>
        <div
          className="sticker-run-list"
          style={{
            display: "flex",
            gap: "0.5rem",
            overflowX: "auto",
            paddingBottom: "0.5rem",
          }}
        >
          {activities.slice(0, 30).map((a) => {
            const km = (a.distance / 1000).toFixed(1);
            const date = new Date(a.start_date_local).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric" }
            );
            const isSelected = selectedActivity?.id === a.id;

            return (
              <button
                key={a.id}
                onClick={() => setSelectedActivity(a)}
                style={{
                  flexShrink: 0,
                  padding: "0.6rem 1rem",
                  background: isSelected
                    ? "linear-gradient(135deg, var(--orange-1), var(--orange-2))"
                    : "var(--surface-2, var(--bg))",
                  border: isSelected
                    ? "1px solid var(--orange-3)"
                    : "1px solid var(--border)",
                  borderRadius: "10px",
                  cursor: "pointer",
                  textAlign: "left",
                  minWidth: "140px",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: isSelected ? "var(--orange-5)" : "var(--text)",
                    marginBottom: "2px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "160px",
                  }}
                >
                  {a.name}
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-muted)",
                  }}
                >
                  {km} km · {date}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedActivity && config && (
        <>
          {/* Theme toggle + custom text */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "flex-end",
              flexWrap: "wrap",
            }}
          >
            {/* Dark / Clear toggle */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.7rem",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-muted)",
                  marginBottom: "0.4rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Theme
              </label>
              <div style={{ display: "flex", gap: "0.25rem" }}>
                {(["dark", "clear"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    style={{
                      padding: "0.35rem 0.8rem",
                      border:
                        theme === t
                          ? "1px solid var(--orange-3)"
                          : "1px solid var(--border)",
                      borderRadius: "6px",
                      background:
                        theme === t
                          ? "var(--orange-1)"
                          : "transparent",
                      color:
                        theme === t
                          ? "var(--orange-5)"
                          : "var(--text-muted)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom text input (if template supports it) */}
            {currentTemplate.hasCustomText && (
              <div style={{ flex: 1, minWidth: "200px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.7rem",
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-muted)",
                    marginBottom: "0.4rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Custom text
                </label>
                <input
                  type="text"
                  value={customTexts[selectedTemplate] || ""}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={currentTemplate.textPlaceholder || "Enter text..."}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--text)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8rem",
                    outline: "none",
                  }}
                />
                {currentTemplate.id === "poetic" && (
                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: "var(--text-dim, var(--text-muted))",
                      marginTop: "4px",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    Use \n for new line. Variables: {"{distance}"}, {"{pace}"},{" "}
                    {"{time}"}, {"{location}"}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview area */}
          <div style={{ marginBottom: "1rem" }}>
            <StickerPreview template={currentTemplate} config={config} />
          </div>

          {/* Template gallery */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.7rem",
                fontFamily: "var(--font-mono)",
                color: "var(--text-muted)",
                marginBottom: "0.5rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Templates
            </label>
            <div
              className="sticker-gallery"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "0.5rem",
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
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            color: "var(--text-muted)",
            fontSize: "0.85rem",
          }}
        >
          No runs found for this period. Try a different filter.
        </div>
      )}
    </div>
  );
}
