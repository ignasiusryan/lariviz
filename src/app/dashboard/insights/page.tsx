"use client";

import { useRunData } from "@/components/providers/RunDataProvider";
import { CardSection } from "@/components/dashboard/CardSection";
import { PaceChart } from "@/components/PaceChart";

export default function InsightsPage() {
  const { filteredActivities, activities, mode } = useRunData();

  return (
    <CardSection title="Pace vs Distance">
      <PaceChart
        activities={filteredActivities}
        allActivities={activities}
        showYearComparison={mode.type === "all"}
      />
    </CardSection>
  );
}
