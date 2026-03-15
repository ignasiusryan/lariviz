import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const host = request.headers.get("host");
  const xForwardedHost = request.headers.get("x-forwarded-host");
  const xForwardedProto = request.headers.get("x-forwarded-proto");
  const cookies = request.cookies.getAll().map((c) => c.name);

  return NextResponse.json({
    origin,
    host,
    xForwardedHost,
    xForwardedProto,
    cookies,
    env: {
      hasClientId: !!process.env.STRAVA_CLIENT_ID,
      hasClientSecret: !!process.env.STRAVA_CLIENT_SECRET,
      hasCookieSecret: !!process.env.COOKIE_SECRET,
      nodeEnv: process.env.NODE_ENV,
    },
  });
}
