"use client";

import { useRunData } from "@/components/providers/RunDataProvider";
import { CardSection } from "@/components/dashboard/CardSection";
import { StickerTab } from "@/components/StickerTab";

export default function StickersPage() {
  const { filteredActivities, athleteName, shoes } = useRunData();

  return (
    <CardSection title="Create Sticker">
      <StickerTab
        activities={filteredActivities}
        athleteName={athleteName}
        shoes={shoes}
      />
    </CardSection>
  );
}
