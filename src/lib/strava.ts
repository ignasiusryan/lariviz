import { getSession, setSession } from "./session";

const STRAVA_API = "https://www.strava.com/api/v3";
const TOKEN_URL = "https://www.strava.com/oauth/token";

async function refreshIfNeeded() {
  const session = await getSession();
  if (!session) throw new Error("No session");

  // Refresh if token expires within 5 minutes
  if (session.expires_at < Date.now() / 1000 + 300) {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: session.refresh_token,
      }),
    });

    if (!res.ok) throw new Error("Token refresh failed");

    const data = await res.json();
    const updated = {
      ...session,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
    };
    await setSession(updated);
    return updated;
  }

  return session;
}

export async function stravaFetch(path: string): Promise<Response> {
  const session = await refreshIfNeeded();
  return fetch(`${STRAVA_API}${path}`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
}
