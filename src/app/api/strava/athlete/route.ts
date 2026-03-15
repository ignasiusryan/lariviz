import { NextResponse } from "next/server";
import { stravaFetch } from "@/lib/strava";

export async function GET() {
  try {
    const res = await stravaFetch("/athlete");
    if (!res.ok) {
      return NextResponse.json(
        { error: "Strava API error" },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
