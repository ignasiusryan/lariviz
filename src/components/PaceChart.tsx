"use client";

import { useState, useMemo } from "react";
import { formatPace } from "@/lib/format";
import type { Activity } from "./Dashboard";

interface Props {
  activities: Activity[];
}

interface DataPoint {
  id: number;
  name: string;
  date: string;
  distanceKm: number;
  paceMinKm: number;
}

export function PaceChart({ activities }: Props) {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  const points = useMemo(() => {
    return activities
      .filter((a) => a.distance > 0 && a.moving_time > 0)
      .map((a) => {
        const distanceKm = a.distance / 1000;
        // pace = minutes per km
        const paceMinKm = a.moving_time / 60 / distanceKm;
        return {
          id: a.id,
          name: a.name,
          date: a.start_date_local.slice(0, 10),
          distanceKm,
          paceMinKm,
        };
      })
      .filter((p) => p.paceMinKm > 2 && p.paceMinKm < 15); // filter outliers
  }, [activities]);

  if (points.length === 0) {
    return (
      <div
        style={{
          padding: "3rem",
          textAlign: "center",
          color: "var(--text-dim)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.8rem",
        }}
      >
        No pace data available
      </div>
    );
  }

  // Chart dimensions
  const width = 800;
  const height = 420;
  const pad = { top: 20, right: 30, bottom: 50, left: 55 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  // Axis ranges
  const maxDist = Math.ceil(Math.max(...points.map((p) => p.distanceKm)) + 1);
  const minPace = Math.floor(Math.min(...points.map((p) => p.paceMinKm)));
  const maxPace = Math.ceil(Math.max(...points.map((p) => p.paceMinKm)));

  // Scale functions
  const xScale = (v: number) => pad.left + (v / maxDist) * plotW;
  const yScale = (v: number) =>
    pad.top + ((v - minPace) / (maxPace - minPace)) * plotH;

  // Grid lines
  const xTicks: number[] = [];
  const xStep = maxDist <= 15 ? 2 : maxDist <= 30 ? 5 : 10;
  for (let i = 0; i <= maxDist; i += xStep) xTicks.push(i);

  const yTicks: number[] = [];
  const yStep = maxPace - minPace > 6 ? 1 : 0.5;
  for (let i = minPace; i <= maxPace; i += yStep) yTicks.push(i);

  // Color by pace (faster = brighter orange)
  const getColor = (pace: number) => {
    const t = 1 - (pace - minPace) / (maxPace - minPace); // 1 = fastest
    if (t > 0.8) return "#ff6b00";
    if (t > 0.6) return "#ff8c00";
    if (t > 0.4) return "#ffa940";
    if (t > 0.2) return "#ffc470";
    return "#ffdca8";
  };

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", height: "auto" }}
      >
        {/* Grid lines */}
        {xTicks.map((v) => (
          <line
            key={`xg-${v}`}
            x1={xScale(v)}
            x2={xScale(v)}
            y1={pad.top}
            y2={pad.top + plotH}
            stroke="var(--border)"
            strokeWidth={0.5}
          />
        ))}
        {yTicks.map((v) => (
          <line
            key={`yg-${v}`}
            x1={pad.left}
            x2={pad.left + plotW}
            y1={yScale(v)}
            y2={yScale(v)}
            stroke="var(--border)"
            strokeWidth={0.5}
          />
        ))}

        {/* Axis labels */}
        {xTicks.map((v) => (
          <text
            key={`xl-${v}`}
            x={xScale(v)}
            y={pad.top + plotH + 24}
            textAnchor="middle"
            fill="var(--text-dim)"
            fontSize={10}
            fontFamily="var(--font-mono)"
          >
            {v}
          </text>
        ))}
        {yTicks.map((v) => (
          <text
            key={`yl-${v}`}
            x={pad.left - 10}
            y={yScale(v) + 4}
            textAnchor="end"
            fill="var(--text-dim)"
            fontSize={10}
            fontFamily="var(--font-mono)"
          >
            {formatPace(v)}
          </text>
        ))}

        {/* Axis titles */}
        <text
          x={pad.left + plotW / 2}
          y={height - 6}
          textAnchor="middle"
          fill="var(--text-muted)"
          fontSize={11}
          fontFamily="var(--font-mono)"
        >
          Distance (km)
        </text>
        <text
          x={14}
          y={pad.top + plotH / 2}
          textAnchor="middle"
          fill="var(--text-muted)"
          fontSize={11}
          fontFamily="var(--font-mono)"
          transform={`rotate(-90, 14, ${pad.top + plotH / 2})`}
        >
          Avg Pace (min/km)
        </text>

        {/* Data points */}
        {points.map((p) => (
          <circle
            key={p.id}
            cx={xScale(p.distanceKm)}
            cy={yScale(p.paceMinKm)}
            r={hoveredPoint?.id === p.id ? 6 : 4}
            fill={getColor(p.paceMinKm)}
            opacity={hoveredPoint ? (hoveredPoint.id === p.id ? 1 : 0.3) : 0.75}
            stroke={
              hoveredPoint?.id === p.id ? "var(--text)" : "transparent"
            }
            strokeWidth={1.5}
            style={{ cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={(e) => {
              const svg = e.currentTarget.closest("svg");
              if (!svg) return;
              const rect = svg.getBoundingClientRect();
              const scaleX = rect.width / width;
              const scaleY = rect.height / height;
              setHoverPos({
                x: xScale(p.distanceKm) * scaleX,
                y: yScale(p.paceMinKm) * scaleY,
              });
              setHoveredPoint(p);
            }}
            onMouseLeave={() => setHoveredPoint(null)}
          />
        ))}
      </svg>

      {/* Tooltip */}
      {hoveredPoint && (
        <div
          style={{
            position: "absolute",
            left: hoverPos.x,
            top: hoverPos.y - 12,
            transform: "translate(-50%, -100%)",
            background: "var(--surface)",
            border: "1px solid var(--orange-3)",
            borderRadius: "10px",
            padding: "0.5rem 0.75rem",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 10,
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: "0.75rem",
              color: "var(--text)",
              marginBottom: "0.2rem",
              maxWidth: 200,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {hoveredPoint.name}
          </div>
          <div
            style={{
              fontSize: "0.68rem",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              display: "flex",
              gap: "0.75rem",
            }}
          >
            <span>{hoveredPoint.distanceKm.toFixed(1)} km</span>
            <span>{formatPace(hoveredPoint.paceMinKm)} /km</span>
            <span style={{ color: "var(--text-dim)" }}>{hoveredPoint.date}</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "0.35rem",
          marginTop: "0.75rem",
        }}
      >
        <span
          style={{
            fontSize: "0.65rem",
            color: "var(--text-dim)",
            fontFamily: "var(--font-mono)",
            marginRight: "0.25rem",
          }}
        >
          Slower
        </span>
        {["#ffdca8", "#ffc470", "#ffa940", "#ff8c00", "#ff6b00"].map(
          (c, i) => (
            <div
              key={i}
              style={{
                width: 13,
                height: 13,
                borderRadius: "50%",
                background: c,
              }}
            />
          )
        )}
        <span
          style={{
            fontSize: "0.65rem",
            color: "var(--text-dim)",
            fontFamily: "var(--font-mono)",
            marginLeft: "0.25rem",
          }}
        >
          Faster
        </span>
      </div>
    </div>
  );
}
