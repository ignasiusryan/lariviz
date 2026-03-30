"use client";

import dynamic from "next/dynamic";
import { useRunData } from "@/components/providers/RunDataProvider";
import { CardSection } from "@/components/dashboard/CardSection";

const PosterTab = dynamic(
  () => import("@/components/PosterTab").then((m) => ({ default: m.PosterTab })),
  {
    ssr: false,
    loading: () => (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
        Loading poster...
      </div>
    ),
  }
);

export default function PosterPage() {
  const { filteredActivities, athleteName } = useRunData();

  return (
    <CardSection title="Map Poster">
      <PosterTab activities={filteredActivities} athleteName={athleteName} />
    </CardSection>
  );
}
