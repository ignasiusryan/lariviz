"use client";

import { useRunData } from "@/components/providers/RunDataProvider";
import { CardSection } from "@/components/dashboard/CardSection";
import { RunTimesChart } from "@/components/RunTimesChart";

export default function TimesPage() {
  const { filteredActivities } = useRunData();

  return (
    <CardSection title="Run Times">
      <RunTimesChart activities={filteredActivities} />
    </CardSection>
  );
}
