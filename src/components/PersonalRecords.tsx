"use client";

import { useMemo } from "react";
import { formatDuration, formatPace, formatNumber } from "@/lib/format";
import { decodePolyline, normalizePoints } from "@/lib/polyline";
import type { Activity } from "./Dashboard";

interface Props {
  activities: Activity[];
}

interface PR {
  label: string;
  value: string;
  unit: string;
  activity: Activity | null;
  detail?: string;
}

// Distance ranges for standard race distances (km)
const RACE_DISTANCES: { label: string; target: number; min: number; max: number }[] = [
  { label: "Fastest 5K", target: 5, min: 4.8, max: 5.5 },
  { label: "Fastest 10K", target: 10, min: 9.5, max: 11 },
  { label: "Fastest Half Marathon", target: 21.0975, min: 20, max: 22.5 },
  { label: "Fastest Marathon", target: 42.195, min: 41, max: 44 },
];

const THUMB_SIZE = 48;

function RouteThumb({ activity }: { activity: Activity }) {
  const polyline = activity.map?.summary_polyline;

  const path = useMemo(() => {
    if (!polyline) return null;
    const decoded = decodePolyline(polyline);
    if (decoded.length < 2) return null;
    const pts = normalizePoints(decoded, THUMB_SIZE);
    return (
      "M " +
      pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ")
    );
  }, [polyline]);

  if (!path) return null;

  return (
    <svg
      width={THUMB_SIZE}
      height={THUMB_SIZE}
      viewBox={`0 0 ${THUMB_SIZE} ${THUMB_SIZE}`}
      style={{ display: "block", flexShrink: 0 }}
    >
      <path
        d={path}
        fill="none"
        stroke="var(--orange-5)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
      />
    </svg>
  );
}

function findFastestForDistance(
  activities: Activity[],
  min: number,
  max: number
): Activity | null {
  let best: Activity | null = null;
  let bestPace = Infinity;
  for (const a of activities) {
    const km = a.distance / 1000;
    if (km >= min && km <= max && a.moving_time > 0) {
      const pace = a.moving_time / 60 / km;
      if (pace < bestPace) {
        bestPace = pace;
        best = a;
      }
    }
  }
  return best;
}

export function PersonalRecords({ activities }: Props) {
  const records = useMemo(() => {
    const prs: PR[] = [];

    // Race distance PRs
    for (const race of RACE_DISTANCES) {
      const best = findFastestForDistance(activities, race.min, race.max);
      if (best) {
        prs.push({
          label: race.label,
          value: formatDuration(best.moving_time),
          unit: "",
          activity: best,
          detail: `${formatNumber(best.distance / 1000, 2)} km · ${formatPace(best.moving_time / 60 / (best.distance / 1000))} /km`,
        });
      }
    }

    // Longest run
    if (activities.length > 0) {
      const longest = activities.reduce((a, b) =>
        a.distance > b.distance ? a : b
      );
      if (longest.distance > 0) {
        prs.push({
          label: "Longest Run",
          value: formatNumber(longest.distance / 1000, 2),
          unit: "km",
          activity: longest,
          detail: `${formatDuration(longest.moving_time)} · ${formatPace(longest.moving_time / 60 / (longest.distance / 1000))} /km`,
        });
      }
    }

    // Fastest pace (runs >= 3km to avoid sprints)
    if (activities.length > 0) {
      let bestPace = Infinity;
      let bestActivity: Activity | null = null;
      for (const a of activities) {
        const km = a.distance / 1000;
        if (km >= 3 && a.moving_time > 0) {
          const pace = a.moving_time / 60 / km;
          if (pace < bestPace) {
            bestPace = pace;
            bestActivity = a;
          }
        }
      }
      if (bestActivity) {
        prs.push({
          label: "Fastest Pace",
          value: formatPace(bestPace),
          unit: "/km",
          activity: bestActivity,
          detail: `${formatNumber(bestActivity.distance / 1000, 2)} km · ${formatDuration(bestActivity.moving_time)}`,
        });
      }
    }

    // Most runs in a single day
    if (activities.length > 0) {
      const dayCounts: Record<string, number> = {};
      for (const a of activities) {
        const day = a.start_date_local.slice(0, 10);
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      }
      const maxDay = Object.entries(dayCounts).reduce((a, b) =>
        a[1] > b[1] ? a : b
      );
      if (maxDay[1] > 1) {
        prs.push({
          label: "Most Runs in a Day",
          value: String(maxDay[1]),
          unit: "runs",
          activity: null,
          detail: new Date(maxDay[0] + "T12:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        });
      }
    }

    // Longest streak (consecutive days)
    if (activities.length > 0) {
      const runDays = new Set(
        activities.map((a) => a.start_date_local.slice(0, 10))
      );
      const sortedDays = [...runDays].sort();
      let maxStreak = 1;
      let currentStreak = 1;
      let streakEnd = sortedDays[0];
      let bestStreakEnd = sortedDays[0];

      for (let i = 1; i < sortedDays.length; i++) {
        const prev = new Date(sortedDays[i - 1] + "T12:00:00");
        const curr = new Date(sortedDays[i] + "T12:00:00");
        const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        if (Math.round(diffDays) === 1) {
          currentStreak++;
          if (currentStreak > maxStreak) {
            maxStreak = currentStreak;
            bestStreakEnd = sortedDays[i];
          }
        } else {
          currentStreak = 1;
        }
      }

      if (maxStreak >= 2) {
        const endDate = new Date(bestStreakEnd + "T12:00:00");
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - maxStreak + 1);
        prs.push({
          label: "Longest Streak",
          value: String(maxStreak),
          unit: "days",
          activity: null,
          detail: `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
        });
      }
    }

    return prs;
  }, [activities]);

  if (records.length === 0) {
    return (
      <p style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>
        No personal records found. Keep running!
      </p>
    );
  }

  return (
    <div
      className="pr-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "1rem",
      }}
    >
      {records.map((pr) => (
        <div
          key={pr.label}
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            padding: "1.25rem",
            display: "flex",
            gap: "1rem",
            alignItems: "flex-start",
          }}
        >
          {/* Route thumbnail */}
          {pr.activity && (
            <div
              style={{
                background: "var(--surface)",
                borderRadius: 10,
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <RouteThumb activity={pr.activity} />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Label */}
            <div
              style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                marginBottom: "0.4rem",
              }}
            >
              {pr.label}
            </div>

            {/* Value */}
            <div
              style={{
                fontSize: "1.3rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "var(--orange-5)",
                lineHeight: 1.2,
              }}
            >
              {pr.value}
              {pr.unit && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    color: "var(--text-muted)",
                    marginLeft: "0.2rem",
                  }}
                >
                  {pr.unit}
                </span>
              )}
            </div>

            {/* Activity name */}
            {pr.activity && (
              <div
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "var(--text)",
                  marginTop: "0.35rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {pr.activity.name}
              </div>
            )}

            {/* Detail line (date, pace, etc.) */}
            {pr.detail && (
              <div
                style={{
                  fontSize: "0.68rem",
                  color: "var(--text-dim)",
                  fontFamily: "var(--font-mono)",
                  marginTop: "0.2rem",
                }}
              >
                {pr.activity
                  ? `${new Date(pr.activity.start_date_local).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · ${pr.detail}`
                  : pr.detail}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
