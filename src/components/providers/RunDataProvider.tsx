"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { buildHeatmap, type HeatmapMode, type HeatmapData } from "@/lib/heatmap";
import { geocodeActivities, getGeocodedLocation } from "@/lib/geocode";
import { decodePolyline } from "@/lib/polyline";
import type { Activity, ShoeData } from "@/components/types";

interface RunDataContextValue {
  activities: Activity[];
  filteredActivities: Activity[];
  shoes: ShoeData[];
  mode: HeatmapMode;
  setMode: (m: HeatmapMode) => void;
  excludedYears: Set<number>;
  toggleExcludedYear: (y: number) => void;
  sortedYears: number[];
  dateMap: Record<string, number>;
  heatmapData: HeatmapData | null;
  downloadFilename: string;
  filterLabel: string;
  athleteName: string;
}

const RunDataContext = createContext<RunDataContextValue | null>(null);

export function useRunData() {
  const ctx = useContext(RunDataContext);
  if (!ctx) throw new Error("useRunData must be used within RunDataProvider");
  return ctx;
}

interface Props {
  athleteName: string;
  children: ReactNode;
}

export function RunDataProvider({ athleteName, children }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [shoes, setShoes] = useState<ShoeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<HeatmapMode>({ type: "rolling" });
  const [excludedYears, setExcludedYears] = useState<Set<number>>(new Set());

  const toggleExcludedYear = useCallback((y: number) => {
    setExcludedYears((prev) => {
      const next = new Set(prev);
      if (next.has(y)) {
        next.delete(y);
      } else {
        next.add(y);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [activitiesRes, athleteRes] = await Promise.all([
          fetch("/api/strava/activities"),
          fetch("/api/strava/athlete"),
        ]);
        if (!activitiesRes.ok) {
          if (activitiesRes.status === 401) {
            window.location.href = "/api/auth/logout";
            return;
          }
          throw new Error("Failed to fetch activities");
        }
        const data: Activity[] = await activitiesRes.json();
        setActivities(data);

        // If the user has no runs in the past 365 days but does have older
        // runs, default to "All Years" so they don't land on empty charts.
        const cutoff = Date.now() - 365 * 24 * 60 * 60 * 1000;
        const hasRecentRun = data.some(
          (a) => new Date(a.start_date_local).getTime() >= cutoff
        );
        if (!hasRecentRun && data.length > 0) {
          setMode({ type: "all" });
        }

        if (athleteRes.ok) {
          const athlete = await athleteRes.json();
          if (Array.isArray(athlete.shoes)) {
            setShoes(athlete.shoes);
          }
        }

        // Fill in start_latlng from polyline when missing
        for (const a of data) {
          if ((!a.start_latlng || a.start_latlng.length !== 2) && a.map?.summary_polyline) {
            const pts = decodePolyline(a.map.summary_polyline);
            if (pts.length > 0) {
              a.start_latlng = pts[0];
            }
          }
        }

        // Reverse-geocode activities client-side
        geocodeActivities(data)
          .then(() => {
            setActivities((prev) =>
              prev.map((a) => {
                const geo = getGeocodedLocation(a);
                if (geo && (geo.city || geo.country)) {
                  return { ...a, resolved_city: geo.city, resolved_country: geo.country };
                }
                return a;
              })
            );
          })
          .catch((e) => {
            console.warn("[lariviz] geocode failed:", e);
          });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const sortedYears = useMemo(() => {
    const yearsSet = new Set<number>();
    const currentYear = new Date().getFullYear();
    yearsSet.add(currentYear);
    activities.forEach((a) =>
      yearsSet.add(new Date(a.start_date_local).getFullYear())
    );
    return [...yearsSet].sort((a, b) => b - a);
  }, [activities]);

  const dateMap = useMemo(() => {
    const map: Record<string, number> = {};
    activities.forEach((a) => {
      const d = a.start_date_local.slice(0, 10);
      map[d] = (map[d] || 0) + a.distance / 1000;
    });
    return map;
  }, [activities]);

  const filteredActivities = useMemo(
    () =>
      mode.type === "all"
        ? activities
        : activities.filter((a) => {
            const date = new Date(a.start_date_local);
            if (mode.type === "rolling") {
              const cutoff = new Date();
              cutoff.setDate(cutoff.getDate() - 364);
              return date >= cutoff;
            }
            return date.getFullYear() === mode.year;
          }),
    [activities, mode]
  );

  const heatmapData = useMemo(
    () => (mode.type === "all" ? null : buildHeatmap(dateMap, mode)),
    [dateMap, mode]
  );

  const downloadFilename = useMemo(
    () =>
      mode.type === "all"
        ? "lariviz-heatmap-all-years.png"
        : mode.type === "rolling"
          ? "lariviz-heatmap-past-year.png"
          : `lariviz-heatmap-${mode.year}.png`,
    [mode]
  );

  const filterLabel = useMemo(
    () =>
      mode.type === "all"
        ? "All years"
        : mode.type === "rolling"
          ? "Past year"
          : String(mode.year),
    [mode]
  );

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: "1.5rem",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: "3px solid var(--border)",
            borderTopColor: "var(--orange-5)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <div
          style={{
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          Fetching your runs...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: "1rem",
          padding: "2rem",
        }}
      >
        <p style={{ color: "#ff6b6b", fontSize: "0.9rem" }}>
          Failed to load data: {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "0.5rem 1rem",
            background: "var(--orange-5)",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <RunDataContext.Provider
      value={{
        activities,
        filteredActivities,
        shoes,
        mode,
        setMode,
        excludedYears,
        toggleExcludedYear,
        sortedYears,
        dateMap,
        heatmapData,
        downloadFilename,
        filterLabel,
        athleteName,
      }}
    >
      {children}
    </RunDataContext.Provider>
  );
}
