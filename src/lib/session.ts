import { cookies } from "next/headers";
import { encrypt, decrypt } from "./crypto";

const COOKIE_NAME = "strava_session";

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete_id: number;
  athlete_name: string;
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const cookie = jar.get(COOKIE_NAME);
  if (!cookie?.value) return null;
  try {
    return JSON.parse(decrypt(cookie.value)) as Session;
  } catch {
    return null;
  }
}

export async function setSession(session: Session): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, encrypt(JSON.stringify(session)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
