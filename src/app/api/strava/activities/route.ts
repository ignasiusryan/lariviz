import { NextResponse } from "next/server";
import { stravaFetch } from "@/lib/strava";

export async function GET() {
  try {
    const allActivities: Record<string, unknown>[] = [];
    let page = 1;

    while (page <= 10) {
      const res = await stravaFetch(
        `/athlete/activities?per_page=200&page=${page}`
      );
      if (!res.ok) {
        return NextResponse.json(
          { error: "Strava API error" },
          { status: res.status }
        );
      }
      const batch = await res.json();
      if (!batch.length) break;
      allActivities.push(...batch);
      if (batch.length < 200) break;
      page++;
    }

    // Filter to runs only
    const runs = allActivities.filter(
      (a: Record<string, unknown>) =>
        a.type === "Run" || a.sport_type === "Run"
    );

    return NextResponse.json(runs);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
