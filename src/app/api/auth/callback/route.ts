import { NextRequest, NextResponse } from "next/server";
import { setSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/?error=no_code`);
  }

  const tokenRes = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${baseUrl}/?error=token_exchange_failed`);
  }

  const data = await tokenRes.json();

  await setSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    athlete_id: data.athlete.id,
    athlete_name: `${data.athlete.firstname || ""} ${data.athlete.lastname || ""}`.trim(),
  });

  return NextResponse.redirect(baseUrl);
}
