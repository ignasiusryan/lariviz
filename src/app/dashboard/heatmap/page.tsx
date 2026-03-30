"use client";

import { useRunData } from "@/components/providers/RunDataProvider";
import { CardSection } from "@/components/dashboard/CardSection";
import { Heatmap } from "@/components/Heatmap";
import { StackedHeatmap } from "@/components/StackedHeatmap";
import { DownloadButton } from "@/components/DownloadButton";
import { DownloadStackedButton } from "@/components/DownloadStackedButton";

export default function HeatmapPage() {
  const {
    mode,
    heatmapData,
    filteredActivities,
    athleteName,
    downloadFilename,
    sortedYears,
    excludedYears,
    toggleExcludedYear,
    dateMap,
  } = useRunData();

  const title =
    mode.type === "all" ? "All years of running" : heatmapData!.title;

  const headerRight = heatmapData ? (
    <DownloadButton
      heatmapData={heatmapData}
      activities={filteredActivities}
      athleteName={athleteName}
      filename={downloadFilename}
    />
  ) : (
    <DownloadStackedButton
      years={sortedYears.filter((y) => !excludedYears.has(y))}
      dateMap={dateMap}
      athleteName={athleteName}
    />
  );

  return (
    <CardSection title={title} headerRight={headerRight}>
      {mode.type === "all" ? (
        <StackedHeatmap
          years={sortedYears}
          dateMap={dateMap}
          excluded={excludedYears}
          onToggleYear={(y) => {
            const visibleCount = sortedYears.filter(
              (yr) => !excludedYears.has(yr)
            ).length;
            if (!excludedYears.has(y) && visibleCount <= 1) return;
            toggleExcludedYear(y);
          }}
        />
      ) : (
        <Heatmap data={heatmapData!} />
      )}
    </CardSection>
  );
}
