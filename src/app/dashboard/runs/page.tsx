"use client";

import { useRunData } from "@/components/providers/RunDataProvider";
import { RecentRuns } from "@/components/RecentRuns";

export default function RunsPage() {
  const { filteredActivities } = useRunData();

  return <RecentRuns activities={filteredActivities} limit={20} />;
}
