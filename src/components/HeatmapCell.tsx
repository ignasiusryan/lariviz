"use client";

import { useRef, useState } from "react";
import type { HeatmapDay } from "@/lib/heatmap";

interface Props {
  day: HeatmapDay;
}

export function HeatmapCell({ day }: Props) {
  const cellRef = useRef<HTMLDivElement>(null);
  const [showTip, setShowTip] = useState(false);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });

  if (!day.inRange) {
    return (
      <div
        style={{
          width: 13,
          height: 13,
          borderRadius: 3,
          background: "transparent",
        }}
      />
    );
  }

  if (day.isFuture) {
    return (
      <div
        style={{
          width: 13,
          height: 13,
          borderRadius: 3,
          background: "transparent",
          border: "1px solid var(--border)",
          opacity: 0.3,
        }}
      />
    );
  }

  const levelStyles: Record<number, React.CSSProperties> = {
    0: { background: "var(--surface-2)" },
    1: { background: "var(--orange-1)", border: "1px solid var(--orange-2)" },
    2: { background: "var(--orange-2)" },
    3: { background: "var(--orange-3)" },
    4: { background: "var(--orange-4)" },
    5: {
      background: "var(--orange-5)",
      boxShadow: "0 0 8px rgba(255,140,0,0.3)",
    },
  };

  const d = new Date(day.date + "T00:00:00");
  const formatted = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div
        ref={cellRef}
        onMouseEnter={() => {
          if (cellRef.current) {
            const rect = cellRef.current.getBoundingClientRect();
            setTipPos({ x: rect.left + rect.width / 2, y: rect.top });
          }
          setShowTip(true);
        }}
        onMouseLeave={() => setShowTip(false)}
        style={{
          width: 13,
          height: 13,
          borderRadius: 3,
          cursor: "pointer",
          transition: "outline 0.1s, transform 0.1s",
          ...levelStyles[day.level] || levelStyles[0],
        }}
      />
      {showTip && (
        <div
          style={{
            position: "fixed",
            left: tipPos.x,
            top: tipPos.y - 8,
            transform: "translate(-50%, -100%)",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "0.5rem 0.75rem",
            fontSize: "0.75rem",
            color: "var(--text)",
            pointerEvents: "none",
            zIndex: 1000,
            fontFamily: "var(--font-mono)",
            whiteSpace: "nowrap",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>
            {formatted}
          </div>
          <div style={{ color: "var(--orange-5)", fontWeight: 600 }}>
            {day.km > 0 ? `${day.km.toFixed(1)} km` : "No runs"}
          </div>
        </div>
      )}
    </div>
  );
}
