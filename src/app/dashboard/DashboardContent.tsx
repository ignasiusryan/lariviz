"use client";

import type { ReactNode } from "react";
import { useRunData } from "@/components/providers/RunDataProvider";
import { YearSelector } from "@/components/YearSelector";
import { StatsRow } from "@/components/StatsRow";
import { StravaAttribution } from "@/components/StravaAttribution";

export function DashboardContent({ children }: { children: ReactNode }) {
  const { sortedYears, mode, setMode, filteredActivities } = useRunData();

  return (
    <div
      className="dashboard-container"
      style={{
        maxWidth: "1100px",
        padding: "0 2rem 4rem",
        animation: "fadeIn 0.6s ease",
      }}
    >
      {/* Global year filter */}
      <div
        className="year-selector"
        style={{
          display: "flex",
          gap: "0.25rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
          alignItems: "center",
        }}
      >
        <YearSelector years={sortedYears} mode={mode} onSelect={setMode} />
      </div>

      {/* Stats */}
      <StatsRow activities={filteredActivities} />

      {/* Page content */}
      {children}

      {/* Attribution */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "2rem",
        }}
      >
        <StravaAttribution />
      </div>
    </div>
  );
}
