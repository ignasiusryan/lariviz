"use client";

import { useRunData } from "@/components/providers/RunDataProvider";
import { CardSection } from "@/components/dashboard/CardSection";
import { PersonalRecords } from "@/components/PersonalRecords";

export default function RecordsPage() {
  const { filteredActivities } = useRunData();

  return (
    <CardSection title="Personal Records">
      <PersonalRecords activities={filteredActivities} />
    </CardSection>
  );
}
