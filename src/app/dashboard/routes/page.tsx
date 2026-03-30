"use client";

import { useRunData } from "@/components/providers/RunDataProvider";
import { CardSection } from "@/components/dashboard/CardSection";
import { RouteFacets } from "@/components/RouteFacets";
import { DownloadFacetsButton } from "@/components/DownloadFacetsButton";

export default function RoutesPage() {
  const { filteredActivities, athleteName } = useRunData();

  return (
    <CardSection
      title="Route Facets"
      headerRight={
        <DownloadFacetsButton
          activities={filteredActivities}
          athleteName={athleteName}
        />
      }
    >
      <RouteFacets activities={filteredActivities} />
    </CardSection>
  );
}
